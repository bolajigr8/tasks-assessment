import mongoose, { Document, Schema } from 'mongoose'

export interface IBlacklistedToken extends Document {
  token: string
  expiresAt: Date
}

const blacklistedTokenSchema = new Schema<IBlacklistedToken>({
  token: {
    type: String,
    required: true,
    unique: true,
  },
  expiresAt: {
    type: Date,
    required: true,
    // MongoDB TTL index — the database automatically removes documents once
    // expiresAt is reached. No cron job or manual cleanup needed.
    // This keeps the blacklist lean: only active-but-invalidated tokens live here.
    expires: 0,
  },
})

export const BlacklistedToken = mongoose.model<IBlacklistedToken>(
  'BlacklistedToken',
  blacklistedTokenSchema,
)
