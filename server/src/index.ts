import 'dotenv/config'
import app from './app.js'
import { connectToDatabase } from './config/database.js'

const PORT = process.env.PORT ?? 5000

async function startServer(): Promise<void> {
  // Database must be ready before we accept any requests
  await connectToDatabase()

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    console.log(`API docs: http://localhost:${PORT}/api-docs`)
  })
}

startServer()
