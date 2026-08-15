import type { Request, Response } from 'express'
import { interviewService } from '../services/interviewService'
import { questionService } from '../services/questionService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const questionController = {
  /**
   * GET /api/interviews/:id/questions
   * Ownership is enforced the exact same way as every other interview read:
   * interviewService.getOwned throws 404 for both "doesn't exist" and
   * "belongs to someone else" before a single question is touched.
   */
  listForInterview: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const interview = await interviewService.getOwned(req.userId, req.params.id)
    const questions = await questionService.listForInterview(interview._id.toString())
    sendSuccess(res, 200, 'Questions retrieved', { questions })
  }),
}
