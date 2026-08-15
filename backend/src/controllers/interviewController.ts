import type { Request, Response } from 'express'
import { interviewService } from '../services/interviewService'
import { sendSuccess } from '../utils/apiResponse'
import { catchAsync } from '../utils/catchAsync'
import { AppError } from '../utils/AppError'

export const interviewController = {
  create: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const interview = await interviewService.create(req.userId, req.body)
    sendSuccess(res, 201, 'Interview created', { interview })
  }),

  list: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const interviews = await interviewService.listForUser(req.userId)
    sendSuccess(res, 200, 'Interviews retrieved', { interviews })
  }),

  getOne: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const interview = await interviewService.getOwned(req.userId, req.params.id)
    sendSuccess(res, 200, 'Interview retrieved', { interview })
  }),

  update: catchAsync(async (req: Request, res: Response) => {
    if (!req.userId) throw AppError.unauthorized()
    const interview = await interviewService.update(req.userId, req.params.id, req.body)
    sendSuccess(res, 200, 'Interview updated', { interview })
  }),
}