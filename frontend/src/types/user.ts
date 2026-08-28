export interface User {
  id: string
  name: string
  email: string
  targetRole?: string
  skills?: string[]
  resumeId?: string
  // Phase 10D — mirrors the User model's preferences subdocument
  // (backend/src/models/User.ts). Optional because users created before
  // this phase are still served correctly by the backend (Mongoose
  // applies the schema default on read), but the type itself can't
  // guarantee that for every possible caller.
  preferences?: {
    emailDigest: boolean
    practiceReminders: boolean
  }
  createdAt: string
}

export interface AuthResponse {
  user: User
  token?: string
}
