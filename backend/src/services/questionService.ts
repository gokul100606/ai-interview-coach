import { Question, IQuestion } from '../models/Question'
import { questionGenerationService } from './questionGenerationService'
import type { IInterview } from '../models/Interview'

export const questionService = {
  /**
   * Generates and persists the full question set for a freshly created
   * interview. Called once, right after Interview.create() succeeds — see
   * interviewService.create().
   */
  async generateForInterview(interview: IInterview): Promise<IQuestion[]> {
    const generated = await questionGenerationService.generate(interview)
    const docs = generated.map((q, i) => ({
      interviewId: interview._id,
      questionText: q.questionText,
      category: q.category,
      topic: q.topic,
      difficulty: q.difficulty,
      order: i + 1,
      expectedTopics: q.expectedTopics,
    }))
    return Question.insertMany(docs)
  },

  /** Ownership is NOT checked here — callers must verify the interview
   * belongs to the requesting user first (see questionController). This
   * function only knows about interviewId, not who's allowed to see it. */
  async listForInterview(interviewId: string): Promise<IQuestion[]> {
    return Question.find({ interviewId }).sort({ order: 1 })
  },
}
