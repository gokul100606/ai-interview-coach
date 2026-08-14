import { Schema, model, Document, Types } from 'mongoose'
import bcrypt from 'bcryptjs'

export interface IUser extends Document {
  _id: Types.ObjectId
  name: string
  email: string
  passwordHash: string
  targetRole?: string
  skills: string[]
  resume?: {
    fileName: string
    storagePath: string
    parsedSkills?: string[]
    parsedText?: string
    uploadedAt: Date
  }
  createdAt: Date
  updatedAt: Date
  comparePassword(candidate: string): Promise<boolean>
}

const resumeSchema = new Schema(
  {
    fileName: { type: String, required: true },
    storagePath: { type: String, required: true },
    parsedSkills: { type: [String], default: [] },
    parsedText: { type: String },
    uploadedAt: { type: Date, default: Date.now },
  },
  { _id: false },
)

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, maxlength: 100 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email address'],
    },
    // Never selected by default — must opt in with .select('+passwordHash') for login.
    passwordHash: { type: String, required: true, select: false },
    targetRole: { type: String, trim: true, maxlength: 100 },
    skills: { type: [String], default: [] },
    resume: { type: resumeSchema, default: undefined },
  },
  { timestamps: true },
)

// Unique index is created via the `unique: true` field option above.

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete ret._id
    delete ret.__v
    delete ret.passwordHash
    return ret
  },
})

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash)
}

export const User = model<IUser>('User', userSchema)
