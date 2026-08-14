import type { Request, Response, NextFunction, RequestHandler } from 'express'

/**
 * Wraps an async route handler so rejected promises are forwarded to
 * Express's error middleware instead of crashing the process or hanging
 * the request. Avoids a try/catch block in every controller.
 */
export function catchAsync(fn: RequestHandler) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next)
  }
}
