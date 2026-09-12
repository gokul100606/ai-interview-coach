import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import { env } from './config/env'
import { apiLimiter } from './middleware/rateLimiter'
import { notFoundHandler, errorHandler } from './middleware/errorMiddleware'
import { healthRoutes } from './routes/healthRoutes'
import { authRoutes } from './routes/authRoutes'
import { interviewRoutes } from './routes/interviewRoutes'
import { analyticsRoutes } from './routes/analyticsRoutes'
import { questionRoutes } from './routes/questionRoutes'
import { bookmarkRoutes } from './routes/bookmarkRoutes'
import { userRoutes } from './routes/userRoutes'

export function createApp() {
  const app = express()

  // Trust the first hop reverse proxy (e.g. Render/Railway/Heroku/Nginx)
  // so req.ip and req.secure reflect the real client rather than the
  // proxy itself. Needed for express-rate-limit (apiLimiter/authLimiter)
  // to key limits per real client IP instead of bucketing every request
  // behind the proxy as one IP, and for cookie/protocol detection to stay
  // correct in front of a TLS-terminating proxy. Value of 1 trusts
  // exactly one hop; increase if the deployment topology has more
  // proxies in front of this server. (Phase 10E)
  app.set('trust proxy', 1)

  // Security headers on every response.
  app.use(helmet())

  // Only the configured frontend origin may send credentialed requests —
  // required because we're using cookie-based auth (see authController).
  app.use(
    cors({
      origin: env.CLIENT_URL,
      credentials: true,
    }),
  )

  app.use(express.json({ limit: '1mb' }))
  app.use(cookieParser())

  // Health check must bypass the API rate limiter
  app.use('/api', healthRoutes)

  app.use(apiLimiter)
  app.use('/api/auth', authRoutes)
  app.use('/api/interviews', interviewRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/questions', questionRoutes)
  app.use('/api/bookmarks', bookmarkRoutes)
  app.use('/api/users', userRoutes)

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}