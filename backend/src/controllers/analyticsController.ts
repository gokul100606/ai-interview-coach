import type { Request, Response } from 'express'
import { analyticsService } from '../services/analyticsService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const analyticsController = {
  /**
   * GET /api/analytics/dashboard
   * Identity comes only from req.userId, set by requireAuth after
   * verifying the JWT — there is no :userId route param and no userId
   * accepted from query/body, so a client can never request another
   * user's dashboard.
   */
  getDashboard: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const dashboard = await analyticsService.getDashboard(req.userId)
    sendSuccess(res, 200, 'Dashboard retrieved', { dashboard })
  }),
}
