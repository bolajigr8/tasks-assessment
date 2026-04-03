import { Request, Response, NextFunction } from 'express'
import { User } from '../models/User.js'
import * as authService from '../services/auth.service.js'
import { AuthenticatedRequest } from '../types/index.js'

export async function register(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { name, email, password } = req.body
    const { user, token } = await authService.registerUser({
      name,
      email,
      password,
    })
    res.status(201).json({ status: 'success', token, data: { user } })
  } catch (error) {
    next(error)
  }
}

export async function login(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const { email, password } = req.body
    const { user, token } = await authService.loginUser({ email, password })
    res.status(200).json({ status: 'success', token, data: { user } })
  } catch (error) {
    next(error)
  }
}

export async function logout(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      res.status(401).json({ status: 'fail', message: 'No token provided' })
      return
    }
    await authService.logoutUser(token)
    res
      .status(200)
      .json({ status: 'success', message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getMe(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const user = await User.findById(req.user!.id)

    // The token was valid but the account may have been deleted after it was issued
    if (!user) {
      res.status(404).json({ status: 'fail', message: 'User no longer exists' })
      return
    }

    res.status(200).json({ status: 'success', data: { user } })
  } catch (error) {
    next(error)
  }
}
