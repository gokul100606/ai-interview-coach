import type { Request, Response, NextFunction } from 'express'
import type { ZodSchema } from 'zod'
import { AppError } from '../utils/AppError'

/**
 * Generic body-validation middleware. Parses req.body against the given
 * Zod schema; on failure, forwards a 422 with a flat list of field errors
 * in the exact shape the frontend expects: { success: false, message, errors }.
 */
export function validate(schema: ZodSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body)
    if (!result.success) {
      const errors = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }))
      return next(AppError.validation('Validation failed', errors))
    }
    req.body = result.data
    next()
  }
}
