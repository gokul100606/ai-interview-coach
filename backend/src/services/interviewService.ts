import { Types } from 'mongoose'
import { Interview, IInterview } from '../models/Interview'
import { AppError } from '../utils/AppError'
import { questionService } from './questionService'
import type { CreateInterviewInput, UpdateInterviewInput } from '../validators/interviewValidators'

export const interviewService = {
  async create(userId: string, input: CreateInterviewInput): Promise<IInterview> {
    const interview = await Interview.create({ ...input, userId, status: 'CREATED' })
    // Generated synchronously so the interview is immediately ready to take
    // — InterviewRoom fetches questions right after creation with no wait
    // or "is it ready yet?" polling. When a real AI service replaces the
    // mock generator, this stays the natural place to call it.
    await questionService.generateForInterview(interview)
    return interview
  },

  async listForUser(userId: string): Promise<IInterview[]> {
    return Interview.find({ userId }).sort({ createdAt: -1 })
  },

  /**
   * Fetches an interview and confirms it belongs to `userId`. Returns 404 —
   * not 403 — for both "doesn't exist" and "exists but isn't yours", so a
   * user can't use the status code to probe for other people's interview
   * ids. This is the ONLY way any route reads an interview by id.
   */
  async getOwned(userId: string, interviewId: string): Promise<IInterview> {
    if (!Types.ObjectId.isValid(interviewId)) {
      throw AppError.notFound('Interview not found')
    }
    const interview = await Interview.findById(interviewId)
    if (!interview || interview.userId.toString() !== userId) {
      throw AppError.notFound('Interview not found')
    }
    return interview
  },

  async update(userId: string, interviewId: string, input: UpdateInterviewInput): Promise<IInterview> {
    const interview = await this.getOwned(userId, interviewId)

    if (input.status !== undefined) interview.status = input.status
    if (input.startedAt !== undefined) interview.startedAt = new Date(input.startedAt)
    if (input.completedAt !== undefined) interview.completedAt = new Date(input.completedAt)
    if (input.overallScore !== undefined) interview.overallScore = input.overallScore

    await interview.save()
    return interview
  },
}
