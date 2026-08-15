import { Types } from 'mongoose'
import { Answer, IAnswer } from '../models/Answer'
import { Question } from '../models/Question'
import { interviewService } from './interviewService'
import { answerEvaluationService } from './answerEvaluationService'
import { AppError } from '../utils/AppError'
import type { SubmitAnswerInput } from '../validators/answerValidators'

export const answerService = {
  /**
   * Ownership chain enforced in order, each step 404-ing rather than
   * leaking why: interview must belong to the caller (reuses
   * interviewService.getOwned — no duplicated ownership logic), then the
   * question must actually belong to that interview.
   */
  async submitAnswer(userId: string, interviewId: string, input: SubmitAnswerInput): Promise<IAnswer> {
    const interview = await interviewService.getOwned(userId, interviewId)

    if (!Types.ObjectId.isValid(input.questionId)) {
      throw AppError.notFound('Question not found for this interview')
    }
    const question = await Question.findOne({ _id: input.questionId, interviewId: interview._id })
    if (!question) {
      throw AppError.notFound('Question not found for this interview')
    }

    const evaluation = await answerEvaluationService.evaluateAnswer({
      question,
      answer: input.answerText,
      interview,
    })

    // One answer per question (Answer schema has a unique index on
    // questionId) — resubmitting the same question updates the existing
    // answer in place rather than erroring on a duplicate key or creating
    // a second document. This is the natural fit given that constraint
    // already existed in the schema before this phase.
    const answer = await Answer.findOneAndUpdate(
      { questionId: question._id },
      {
        interviewId: interview._id,
        questionId: question._id,
        userId: interview.userId,
        answerText: input.answerText,
        ...evaluation,
      },
      { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true },
    )

    await this.advanceInterviewStatus(interview)

    return answer
  },

  /**
   * Small, safe lifecycle nudge — not a redesign of interview status:
   * the first answer moves CREATED -> IN_PROGRESS; once every question in
   * the interview has an answer, it moves to COMPLETED with an aggregate
   * score. Both transitions only ever move forward and only use status
   * values / fields (overallScore, startedAt, completedAt) that already
   * existed on the Interview model from Phase 2 but nothing was setting yet.
   */
  async advanceInterviewStatus(interview: Awaited<ReturnType<typeof interviewService.getOwned>>): Promise<void> {
    if (interview.status === 'CREATED') {
      interview.status = 'IN_PROGRESS'
      interview.startedAt = interview.startedAt ?? new Date()
    }

    if (interview.status !== 'COMPLETED') {
      const [totalQuestions, answers] = await Promise.all([
        Question.countDocuments({ interviewId: interview._id }),
        Answer.find({ interviewId: interview._id }).select('overallScore'),
      ])
      if (totalQuestions > 0 && answers.length >= totalQuestions) {
        const avgScore = Math.round(answers.reduce((sum, a) => sum + a.overallScore, 0) / answers.length)
        interview.status = 'COMPLETED'
        interview.completedAt = new Date()
        interview.overallScore = avgScore
      }
    }

    await interview.save()
  },
}
