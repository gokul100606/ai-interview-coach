import type { Request, Response } from 'express'
import { bookmarkService } from '../services/bookmarkService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const bookmarkController = {
  /** POST /api/questions/:id/bookmark */
  add: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    await bookmarkService.addBookmark(req.userId, req.params.id)
    sendSuccess(res, 200, 'Question bookmarked', { bookmarked: true })
  }),

  /** DELETE /api/questions/:id/bookmark */
  remove: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    await bookmarkService.removeBookmark(req.userId, req.params.id)
    sendSuccess(res, 200, 'Bookmark removed', { bookmarked: false })
  }),

  /** GET /api/bookmarks */
  list: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const userId = req.userId
    const questions = await bookmarkService.listBookmarked(userId)
    const serialized = questions.map((q) => bookmarkService.toQuestionWithBookmarkState(q, userId))
    sendSuccess(res, 200, 'Bookmarks retrieved', { questions: serialized })
  }),
}
