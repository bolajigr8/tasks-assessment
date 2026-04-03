import express from 'express'
import cors from 'cors'
import swaggerUi from 'swagger-ui-express'
import { swaggerSpec } from './config/swagger.js'
import authRoutes from './routes/auth.routes.js'
import taskRoutes from './routes/task.routes.js'
import { errorHandler } from './middleware/errorHandler.js'

const app = express()

app.use(
  cors({
    origin: process.env.CLIENT_URL ?? 'http://localhost:3000',
    credentials: true,
  }),
)
app.use(express.json())

// Interactive API documentation accessible at /api-docs in any environment
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

app.use('/api/auth', authRoutes)
app.use('/api/tasks', taskRoutes)

app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok', uptime: process.uptime() })
})

// Catch-all for routes that don't exist
app.use((_req, res) => {
  res.status(404).json({ status: 'fail', message: 'Route not found' })
})

app.use(errorHandler)

export default app
