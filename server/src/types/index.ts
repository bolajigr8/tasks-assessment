import { Request } from 'express'
import { Types } from 'mongoose'

// Extends the base Express Request so authenticated routes
// have access to the decoded user without casting everywhere
export interface AuthenticatedRequest extends Request {
  user?: {
    id: Types.ObjectId
    email: string
    role: string
  }
}

export interface JwtPayload {
  id: string
  email: string
  role: string
  iat?: number
  exp?: number
}
