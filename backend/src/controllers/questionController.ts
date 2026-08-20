import type { Request, Response } from 'express'
import { interviewService } from '../services/interviewService'
import { questionService } from '../services/questionService'
import { bookmarkService } from '../services/bookmarkService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const questionController = {
  /**
   * GET /api/interviews/:id/questions
   * Ownership is enforced the exact same way as every other interview read:
   * interviewService.getOwned throws 404 for both "doesn't exist" and
   * "belongs to someone else" before a single question is touched.
   *
   * Phase 10C: each question is serialized through
   * bookmarkService.toQuestionWithBookmarkState so the response carries a
   * real per-user `bookmarked: true/false` instead of the raw
   * bookmarkedBy id array — InterviewRoom.tsx now initializes its bookmark
   * icon from this instead of always starting unbookmarked.
   */
  listForInterview: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const userId = req.userId
    const interview = await interviewService.getOwned(userId, req.params.id)
    const questions = await questionService.listForInterview(interview._id.toString())
    const questionsWithBookmarkState = questions.map((q) => bookmarkService.toQuestionWithBookmarkState(q, userId))
    sendSuccess(res, 200, 'Questions retrieved', { questions: questionsWithBookmarkState })
  }),
}
