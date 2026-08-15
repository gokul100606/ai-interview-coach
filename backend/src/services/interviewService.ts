import { Types } from 'mongoose'
import { Interview, IInterview } from '../models/Interview'
import { AppError } from '../utils/AppError'
import type { CreateInterviewInput, UpdateInterviewInput } from '../validators/interviewValidators'

export const interviewService = {
  async create(userId: string, input: CreateInterviewInput): Promise<IInterview> {
    return Interview.create({ ...input, userId, status: 'CREATED' })
  },

  async listForUser(userId: string): Promise<IInterview[]> {
    return Interview.find({ userId }).sort({ createdAt: -1 })
  },

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