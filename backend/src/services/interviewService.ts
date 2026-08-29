import { Types } from 'mongoose'
import { Interview, IInterview } from '../models/Interview'
import { Question } from '../models/Question'
import { AppError } from '../utils/AppError'
import { questionService } from './questionService'
import type { CreateInterviewInput, UpdateInterviewInput } from '../validators/interviewValidators'

export const interviewService = {
    async create(userId: string, input: CreateInterviewInput): Promise<IInterview> {
    const interview = await Interview.create({ ...input, userId, status: 'CREATED' })
    // Generated synchronously so the interview is immediately ready to take
    // -- InterviewRoom fetches questions right after creation with no wait
    // or "is it ready yet?" polling.
    try {
      await questionService.generateForInterview(interview)
    } catch (err) {
      // Question generation failed (AI service down/timeout/bad response --
      // see questionGenerationService.generate, which already throws a
      // proper AppError). Roll back so a failed creation never leaves an
      // empty, unusable interview sitting in the user's history.
      //
      // Both deletes are scoped strictly to this interview's own _id, so
      // they can never touch any other interview or another interview's
      // questions. Question.insertMany runs ordered by default, which can
      // persist some documents before hitting a failing one, so the
      // Question cleanup is needed even though the common case (a
      // network/timeout failure before any insert) leaves zero to clean up.
      await Question.deleteMany({ interviewId: interview._id })
      await Interview.deleteOne({ _id: interview._id })
      // Re-throw the original error unchanged -- same AppError instance,
      // same status code and message the caller already produced. Nothing
      // here invents a new error type or swallows it.
      throw err
    }
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

  /**
   * PUT /api/interviews/:id — Phase 10A security fix.
   *
   * Only ever applies `resumeId`. This is deliberately an explicit
   * allowlist, not a spread/Object.assign of `input`, as defense-in-depth:
   * even if updateInterviewSchema (interviewValidators.ts) were ever
   * loosened or bypassed upstream and `input` somehow carried a `status`
   * or `overallScore` property again, this function would still never
   * read or apply it. Interview lifecycle/result fields (status,
   * startedAt, completedAt, overallScore) are owned exclusively by
   * answerService.advanceInterviewStatus as answers are submitted and
   * AI-evaluated — this endpoint must never set them directly.
   */
  async update(userId: string, interviewId: string, input: UpdateInterviewInput): Promise<IInterview> {
    const interview = await this.getOwned(userId, interviewId)

    if (input.resumeId !== undefined) interview.resumeId = input.resumeId

    await interview.save()
    return interview
  },
}
