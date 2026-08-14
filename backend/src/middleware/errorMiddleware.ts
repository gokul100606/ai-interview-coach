import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../utils/AppError'
import { env } from '../config/env'

export function notFoundHandler(req: Request, _res: Response, next: NextFunction) {
  next(AppError.notFound(`Route not found: ${req.method} ${req.originalUrl}`))
}

/**
 * Central error handler — the last middleware in the stack. Every thrown
 * AppError (and anything caught by catchAsync) ends up here, so this is the
 * ONE place that decides the wire format of an error response. Unexpected
 * (non-operational) errors are logged with full detail server-side but
 * never leak a stack trace to the client, especially not in production.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
      ...(err.errors ? { errors: err.errors } : {}),
    })
  }

  // Mongoose duplicate-key error (e.g. race on unique email)
  if (isMongoDuplicateKeyError(err)) {
    return res.status(409).json({ success: false, message: 'An account with that email already exists' })
  }

  // Unexpected error — log full detail, return a generic message.
  console.error('[unhandled error]', err)
  return res.status(500).json({
    success: false,
    message: env.isProduction ? 'Something went wrong. Please try again.' : (err as Error)?.message || 'Internal server error',
  })
}

function isMongoDuplicateKeyError(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: number }).code === 11000
}
