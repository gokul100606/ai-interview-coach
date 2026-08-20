import { Types } from 'mongoose'
import { Question, IQuestion } from '../models/Question'
import { interviewService } from './interviewService'
import { AppError } from '../utils/AppError'

// Plain, fully-typed DTO — field-by-field construction from IQuestion,
// same style reportService.ts already uses for ReportQuestionResult.
// bookmarkedBy (the raw list of user ids) is deliberately never sent to
// the client; only the boolean derived from it for the requesting user.
export interface QuestionWithBookmarkState {
  id: string
  interviewId: string
  questionText: string
  category: string
  topic: string
  difficulty: string
  order: number
  expectedTopics: string[]
  bookmarked: boolean
  createdAt: Date
}

/**
 * Question has no userId of its own (by design — see Question.ts);
 * ownership is derived from its parent Interview. This reuses
 * interviewService.getOwned exactly as answerService.submitAnswer already
 * does for the same reason: without this check, a user could bookmark (and
 * then read back via GET /api/bookmarks) a question belonging to someone
 * else's private interview just by guessing/enumerating a Question id.
 */
async function getOwnedQuestion(userId: string, questionId: string): Promise<IQuestion> {
  if (!Types.ObjectId.isValid(questionId)) {
    throw AppError.notFound('Question not found')
  }
  const question = await Question.findById(questionId)
  if (!question) {
    throw AppError.notFound('Question not found')
  }
  // Throws 404 (not 403) if the interview doesn't exist or isn't the
  // caller's — same guarantee used everywhere else in the app.
  await interviewService.getOwned(userId, question.interviewId.toString())
  return question
}

export const bookmarkService = {
  async addBookmark(userId: string, questionId: string): Promise<void> {
    await getOwnedQuestion(userId, questionId)
    // $addToSet is atomic and inherently duplicate-proof — no fetch,
    // manually push, save.
    await Question.findByIdAndUpdate(questionId, { $addToSet: { bookmarkedBy: userId } }, { new: true })
  },

  async removeBookmark(userId: string, questionId: string): Promise<void> {
    await getOwnedQuestion(userId, questionId)
    // $pull on an id that isn't present is a harmless no-op, so this is
    // idempotent by construction — no error if the user hadn't bookmarked it.
    await Question.findByIdAndUpdate(questionId, { $pull: { bookmarkedBy: userId } }, { new: true })
  },

  /**
   * Safe to query directly with no extra ownership join: bookmarkedBy can
   * only ever contain a user's own id for a given question, because
   * addBookmark above only ever succeeds after getOwnedQuestion confirms
   * that same user owns the question's interview.
   */
  async listBookmarked(userId: string): Promise<IQuestion[]> {
    return Question.find({ bookmarkedBy: userId }).sort({ createdAt: -1 })
  },

  toQuestionWithBookmarkState(question: IQuestion, userId: string): QuestionWithBookmarkState {
    return {
      id: question._id.toString(),
      interviewId: question.interviewId.toString(),
      questionText: question.questionText,
      category: question.category,
      topic: question.topic,
      difficulty: question.difficulty,
      order: question.order,
      expectedTopics: question.expectedTopics,
      bookmarked: question.bookmarkedBy.some((id) => id.toString() === userId),
      createdAt: question.createdAt,
    }
  },
}
