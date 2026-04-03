import { Response, NextFunction } from 'express'
import { Types } from 'mongoose'
import { AuthenticatedRequest } from '../types/index.js'
import { BlacklistedToken } from '../models/BlacklistedToken.js'
import { verifyToken } from '../utils/jwt.js'

export async function authenticate(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ status: 'fail', message: 'No token provided' })
    return
  }

  const token = authHeader.split(' ')[1]

  if (!token) {
    res.status(401).json({ status: 'fail', message: 'Malformed token' })
    return
  }

  try {
    const isBlacklisted = await BlacklistedToken.findOne({ token })
    if (isBlacklisted) {
      res.status(401).json({
        status: 'fail',
        message: 'Session has ended. Please log in again.',
      })
      return
    }

    const decoded = verifyToken(token)

    //  incase of admin
    req.user = {
      id: new Types.ObjectId(decoded.id),
      email: decoded.email,
      role: decoded.role,
    }

    next()
  } catch {
    res
      .status(401)
      .json({ status: 'fail', message: 'Invalid or expired token' })
  }
}
