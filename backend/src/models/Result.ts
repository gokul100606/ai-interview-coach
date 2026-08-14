import { Schema, model, Document, Types } from 'mongoose'

export interface ITopicPerformance {
  topic: string
  score: number
}

export interface IRoadmapDay {
  day: number
  focus: string
  tasks: string[]
}

export interface IResult extends Document {
  _id: Types.ObjectId
  interviewId: Types.ObjectId
  userId: Types.ObjectId
  overallScore: number
  technicalScore: number
  communicationScore: number
  relevanceScore: number
  completenessScore: number
  topicPerformance: ITopicPerformance[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  studyRoadmap: IRoadmapDay[]
  createdAt: Date
}

const topicPerformanceSchema = new Schema<ITopicPerformance>(
  { topic: { type: String, required: true }, score: { type: Number, required: true, min: 0, max: 100 } },
  { _id: false },
)

const roadmapDaySchema = new Schema<IRoadmapDay>(
  { day: { type: Number, required: true }, focus: { type: String, required: true }, tasks: { type: [String], default: [] } },
  { _id: false },
)

const resultSchema = new Schema<IResult>(
  {
    interviewId: { type: Schema.Types.ObjectId, ref: 'Interview', required: true, unique: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    overallScore: { type: Number, required: true, min: 0, max: 100 },
    technicalScore: { type: Number, required: true, min: 0, max: 100 },
    communicationScore: { type: Number, required: true, min: 0, max: 100 },
    relevanceScore: { type: Number, required: true, min: 0, max: 100 },
    completenessScore: { type: Number, required: true, min: 0, max: 100 },
    topicPerformance: { type: [topicPerformanceSchema], default: [] },
    strengths: { type: [String], default: [] },
    weaknesses: { type: [String], default: [] },
    recommendations: { type: [String], default: [] },
    studyRoadmap: { type: [roadmapDaySchema], default: [] },
  },
  { timestamps: { createdAt: true, updatedAt: false } },
)

resultSchema.index({ userId: 1, createdAt: -1 })

resultSchema.set('toJSON', {
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    return ret
  },
})

export const Result = model<IResult>('Result', resultSchema)
