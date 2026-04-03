import dns from 'node:dns/promises'
import mongoose from 'mongoose'

// Cloudflare and Google DNS servers — prevents Atlas hostname resolution
// failures that can occur with certain ISP or container DNS configurations
dns.setServers(['1.1.1.1', '1.0.0.1', '8.8.8.8', '8.8.4.4'])

const MONGODB_URI = process.env.MONGODB_URI

if (!MONGODB_URI) {
  throw new Error('MONGODB_URI is not defined in environment variables')
}
// No global caching trick needed here.
export async function connectToDatabase(): Promise<void> {
  try {
    await mongoose.connect(MONGODB_URI!, {
      // Fail fast if the DB isn't reachable — no silent queueing of operations
      bufferCommands: false,
    })
    console.log('MongoDB connected')
  } catch (error) {
    console.error('MongoDB connection error:', error)
    // Hard exit — there's no sensible way to run this API without a database
    process.exit(1)
  }
}
