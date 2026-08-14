import { Schema, model, Document, Types } from 'mongoose'

export type InterviewStatus = 'CREATED' | 'IN_PROGRESS' | 'COMPLETED' | 'ABANDONED'
export type InterviewType = 'Technical' | 'Behavioral' | 'System Design' | 'Mixed'
export type Difficulty = 'easy' | 'medium' | 'hard'

export interface IInterview extends Document {
  _id: Types.ObjectId
  userId: Types.ObjectId
  role: string
  interviewType: InterviewType
  difficulty: Difficulty
  questionCount: number
  status: InterviewStatus
  resumeId?: string
  overallScore?: number
  startedAt?: Date
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const interviewSchema = new Schema<IInterview>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    role: { type: String, required: true, trim: true, maxlength: 100 },
    interviewType: { type: String, enum: ['Technical', 'Behavioral', 'System Design', 'Mixed'], required: true },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], required: true },
    questionCount: { type: Number, required: true, min: 1, max: 25 },
    status: { type: String, enum: ['CREATED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'], default: 'CREATED' },
    resumeId: { type: String },
    overallScore: { type: Number, min: 0, max: 100 },
    startedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true },
)

// Every interview list/dashboard query filters by user and usually sorts by
// recency — this index serves both without a separate sort index.
interviewSchema.index({ userId: 1, createdAt: -1 })
interviewSchema.index({ userId: 1, status: 1 })

interviewSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Interview = model<IInterview>('Interview', interviewSchema)
