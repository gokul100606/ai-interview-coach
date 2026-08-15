import type { Request, Response } from 'express'
import { reportService } from '../services/reportService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const reportController = {
  /**
   * GET /api/interviews/:id/report
   * Same ownership guarantee as every other interview read: reportService
   * delegates to interviewService.getOwned, so a foreign or invalid id
   * 404s before any Question/Answer is touched.
   */
  getReport: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const report = await reportService.getReport(req.userId, req.params.id)
    sendSuccess(res, 200, 'Report retrieved', { report })
  }),
}
