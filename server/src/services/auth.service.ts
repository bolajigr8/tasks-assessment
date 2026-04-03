import { createError } from '../middleware/errorHandler.js'
import { BlacklistedToken } from '../models/BlacklistedToken.js'
import { User } from '../models/User.js'
import { getTokenExpiry, signToken } from '../utils/jwt.js'

interface RegisterInput {
  name: string
  email: string
  password: string
}

interface LoginInput {
  email: string
  password: string
}

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email })
  if (existing) {
    throw createError('An account with this email already exists', 409)
  }

  const user = await User.create(input)

  // Admin --- later
  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  return { user, token }
}

export async function loginUser(input: LoginInput) {
  // Password is excluded from queries by default (select: false on the schema).
  // We explicitly opt in here because we need it for comparison.
  const user = await User.findOne({ email: input.email }).select('+password')

  if (!user) {
    // Intentionally vague — we don't reveal whether the email exists
    throw createError('Invalid email or password', 401)
  }

  const passwordMatch = await user.comparePassword(input.password)
  if (!passwordMatch) {
    throw createError('Invalid email or password', 401)
  }

  // Include role in the token so requireAdmin can read it without a DB call
  const token = signToken({
    id: user._id.toString(),
    email: user.email,
    role: user.role,
  })

  return { user, token }
}

export async function logoutUser(token: string): Promise<void> {
  const expiresAt = getTokenExpiry(token)
  // Store the token until it naturally expires so it can't be reused.
  // MongoDB's TTL index handles cleanup automatically after that point.
  await BlacklistedToken.create({ token, expiresAt })
}
