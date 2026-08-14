import { Schema, model, Document, Types } from 'mongoose'

export interface IQuestion extends Document {
  _id: Types.ObjectId
  interviewId: Types.ObjectId
  questionText: string
  category: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  order: number
  expectedTopics: string[]
  bookmarkedBy: Types.ObjectId[]
  createdAt: Date
}

const questionSchema = new Schema<IQuestion>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true },
    questionText: { type: String, required: true },
    category: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    order: { type: Number, required: true, min: 1 },
    expectedTopics: { type: [String], default: [] },
    // Users bookmark individual questions for later review (see §29 of the spec).
    bookmarkedBy: { type: [Schema.Types.ObjectId], ref: 'User', default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

questionSchema.index({ interviewId: 1, order: 1 })
questionSchema.index({ bookmarkedBy: 1 })

questionSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Question = model<IQuestion>('Question', questionSchema)
