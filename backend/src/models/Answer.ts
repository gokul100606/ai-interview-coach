import { Schema, model, Document, Types } from 'mongoose'

export interface IAnswer extends Document {
  _id: Types.ObjectId
  interviewId: Types.ObjectId
  questionId: Types.ObjectId
  userId: Types.ObjectId
  answerText: string
  technicalScore: number
  relevanceScore: number
  clarityScore: number
  completenessScore: number
  overallScore: number
  strengths: string[]
  weaknesses: string[]
  suggestions: string[]
  idealAnswer: string
  createdAt: Date
}

const scoreField = { type: Number, required: true, min: 0, max: 100 }

const answerSchema = new Schema<IAnswer>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    questionId: { type: Schema.Types.ObjectId, ref: 'Question', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    answerText: { type: String, required: true },
    technicalScore: scoreField,
    relevanceScore: scoreField,
    clarityScore: scoreField,
    completenessScore: scoreField,
    overallScore: scoreField,
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    suggestions: { type: [String], default: [] },
    idealAnswer: { type: String, default: '' },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

answerSchema.index({ interviewId: 1 })
answerSchema.index({ questionId: 1 }, { unique: true }) // one answer per question
answerSchema.index({ userId: 1 })

answerSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Answer = model<IAnswer>('Answer', answerSchema)
