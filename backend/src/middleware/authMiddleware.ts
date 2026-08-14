import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../utils/jwt'
import { AppError } from '../utils/AppError'
import { catchAsync } from '../utils/catchAsync'
import { User } from '../models/User'

// Augment Express's Request type so req.userId is known everywhere it's used.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      userId?: string
    }
  }
}

/**
 * Reads the JWT from the httpOnly cookie (never trusts a client-supplied
 * user id from the body/query), verifies it, and confirms the user still
 * exists before attaching req.userId. Every protected route relies on this
 * as the ONLY source of truth for "who is making this request".
 */
export const requireAuth = catchAsync(async (req: Request, _res: Response, next: NextFunction) => {
  const token = req.cookies?.token
  if (!token) {
    return next(AppError.unauthorized('You must be logged in to do that'))
  }

  let payload
  try {
    payload = verifyToken(token)
  } catch {
    return next(AppError.unauthorized('Your session has expired — please log in again'))
  }

  const user = await User.findById(payload.userId)
  if (!user) {
    return next(AppError.unauthorized('Your session is no longer valid'))
  }

  req.userId = user._id.toString()
  next()
})
