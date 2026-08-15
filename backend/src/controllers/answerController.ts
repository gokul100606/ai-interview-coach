import type { Request, Response } from 'express'
import { answerService } from '../services/answerService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const answerController = {
  /**
   * POST /api/interviews/:id/answers
   * req.userId comes only from the verified JWT (requireAuth). Scores,
   * strengths, weaknesses, and idealAnswer are never accepted from the
   * client — answerService.submitAnswer computes all of that server-side.
   */
  submit: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const answer = await answerService.submitAnswer(req.userId, req.params.id, req.body)
    sendSuccess(res, 201, 'Answer submitted', { answer })
  }),
}
