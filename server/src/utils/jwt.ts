import jwt from 'jsonwebtoken'
import { JwtPayload } from '../types/index.js'

const JWT_SECRET = process.env.JWT_SECRET!
const JWT_EXPIRES_IN = '1d'

export function signToken(payload: Omit<JwtPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

// Used during logout to set the correct TTL on the blacklist document.
// jwt.decode skips signature verification
// we've already verified the token in the auth middleware before reaching logout.
export function getTokenExpiry(token: string): Date {
  const decoded = jwt.decode(token) as JwtPayload
  return new Date((decoded.exp ?? 0) * 1000)
}
