import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import authRoutes from './routes/auth.routes'
import incidentRoutes from './routes/incidents.routes'
import areasRoutes from './routes/areas.routes'
import uploadRoutes from './routes/upload.routes'
import { errorHandler } from './middleware/errorHandler'

const app = express()

app.use(helmet())
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }))
app.use(express.json({ limit: '10mb' }))

const limiter = rateLimit({ windowMs: 60 * 1000, max: 100, standardHeaders: true, legacyHeaders: false })
app.use('/api', limiter)

app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'pune-live-traffic-api' }))

app.use('/api/auth', authRoutes)
app.use('/api/incidents', incidentRoutes)
app.use('/api/areas', areasRoutes)
app.use('/api/upload', uploadRoutes)

app.use(errorHandler)

export default app
