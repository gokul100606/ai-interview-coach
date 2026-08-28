import type { Request, Response } from 'express'
import { userService } from '../services/userService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const userController = {
  /**
   * PUT /api/users/me
   * Identity comes only from req.userId, set by requireAuth after
   * verifying the JWT — there is no :userId route param and no userId
   * accepted from body/query, so a client can never update another
   * user's profile.
   */
  updateMe: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const user = await userService.updateProfile(req.userId, req.body)
    sendSuccess(res, 200, 'Profile updated', { user })
  }),
}
