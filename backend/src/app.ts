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


export function createApp() {
  const app = express()

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
  app.use(apiLimiter)

  app.use('/api', healthRoutes)
  app.use('/api/auth', authRoutes)
  app.use('/api/interviews', interviewRoutes)
  app.use('/api/analytics', analyticsRoutes)
  app.use('/api/questions', questionRoutes)
  app.use('/api/bookmarks', bookmarkRoutes)

  // More resource routes (questions, answers, results) are added here in
  // later phases.

  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
