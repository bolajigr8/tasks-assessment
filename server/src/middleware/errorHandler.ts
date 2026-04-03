import { Request, Response, NextFunction } from 'express'

export interface AppError extends Error {
  statusCode?: number
  // Distinguishes errors we threw intentionally (4xx) from unexpected crashes (5xx)
  isOperational?: boolean
}

export function errorHandler(
  err: AppError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = err.statusCode ?? 500

  // Show the real error message for expected errors (validation, not found, etc.)
  // Hide internals for unexpected ones — the client gets a generic message
  const message = err.isOperational
    ? err.message
    : 'Something went wrong. Please try again later.'

  if (process.env.NODE_ENV === 'development') {
    console.error('[Error]', err)
  }

  res.status(statusCode).json({ status: 'error', message })
}

export function createError(message: string, statusCode: number): AppError {
  const error: AppError = new Error(message)
  error.statusCode = statusCode
  error.isOperational = true
  return error
}
