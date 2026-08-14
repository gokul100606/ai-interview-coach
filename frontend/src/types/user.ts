export interface User {
  id: string
  name: string
  email: string
  targetRole?: string
  skills?: string[]
  resumeId?: string
  createdAt: string
}

export interface AuthResponse {
  user: User
  token?: string
}
