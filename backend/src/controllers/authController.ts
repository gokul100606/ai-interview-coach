import type { Request, Response, CookieOptions } from 'express'
import { authService } from '../services/authService'
import { signToken } from '../utils/jwt'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'
import { env } from '../config/env'

const COOKIE_NAME = 'token'

/**
 * Cookie strategy: httpOnly so client-side JS (and therefore XSS) can never
 * read the token; secure in production so it's only ever sent over HTTPS;
 * sameSite 'lax' locally because localhost:5173 -> localhost:5000 is
 * cross-PORT but same-SITE (same registrable domain), so 'lax' is sent on
 * normal fetch calls without needing 'secure'. In production, frontend and
 * API typically live on different domains (cross-site), so we switch to
 * 'none' + secure, which requires HTTPS — appropriate for a real deployment.
 */
function baseCookieOptions(): CookieOptions {
  return {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'none' : 'lax',
    path: '/',
  }
}

function cookieOptions(): CookieOptions {
  return {
    ...baseCookieOptions(),
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days, mirrors JWT_EXPIRES_IN default
  }
}

export const authController = {
  register: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.register(req.body)
    const token = signToken({ userId: user._id.toString() })
    res.cookie(COOKIE_NAME, token, cookieOptions())
    sendSuccess(res, 201, 'Account created', { user })
  }),

  login: catchAsync(async (req: Request, res: Response) => {
    const user = await authService.login(req.body)
    const token = signToken({ userId: user._id.toString() })
    res.cookie(COOKIE_NAME, token, cookieOptions())
    sendSuccess(res, 200, 'Logged in', { user })
  }),

  logout: catchAsync(async (_req: Request, res: Response) => {
    res.clearCookie(COOKIE_NAME, baseCookieOptions())
    sendSuccess(res, 200, 'Logged out')
  }),

  me: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) {
      throw AppError.unauthorized()
    }
    const user = await authService.getById(req.userId)
    sendSuccess(res, 200, 'Current user', { user })
  }),
}
