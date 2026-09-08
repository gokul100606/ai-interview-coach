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
  // Phase 10D: settings toggles that previously only existed as local
  // React state on the Settings page (Settings.tsx) with no persistence
  // at all. Defaults mirror what that page's local state defaulted to
  // before this change, so nothing visibly changes for existing users
  // the first time this field is read.
  preferences: {
    emailDigest: boolean
    practiceReminders: boolean
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

const preferencesSchema = new Schema(
  {
    emailDigest: { type: Boolean, default: true },
    practiceReminders: { type: Boolean, default: false },
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
    preferences: { type: preferencesSchema, default: () => ({}) },
  },
  { timestamps: true },
)

// Belt-and-braces: unique index in addition to `unique: true` above, and a
// transform so passwordHash can never leak even if a route forgets to strip it.

userSchema.set('toJSON', {
  virtuals: true,
  transform: (_doc, ret) => {
    ret.id = ret._id
    delete (ret as { _id?: unknown })._id
    delete (ret as { __v?: unknown }).__v
    delete (ret as { passwordHash?: unknown }).passwordHash
    return ret
  },
})

userSchema.methods.comparePassword = function (candidate: string) {
  return bcrypt.compare(candidate, this.passwordHash)
}

export const User = model<IUser>('User', userSchema)
