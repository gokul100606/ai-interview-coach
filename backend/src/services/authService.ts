import bcrypt from 'bcryptjs'
import { User, IUser } from '../models/User'
import { AppError } from '../utils/AppError'
import type { RegisterInput, LoginInput } from '../validators/authValidators'

const SALT_ROUNDS = 12

export const authService = {
  async register({ name, email, password }: RegisterInput): Promise<IUser> {
    const existing = await User.findOne({ email })
    if (existing) {
      throw AppError.conflict('An account with that email already exists')
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
    const user = await User.create({ name, email, passwordHash })
    return user
  },

  async login({ email, password }: LoginInput): Promise<IUser> {
    // passwordHash is select:false by default — opt in explicitly here.
    const user = await User.findOne({ email }).select('+passwordHash')
    if (!user) {
      throw AppError.unauthorized('Incorrect email or password')
    }
    const isMatch = await user.comparePassword(password)
    if (!isMatch) {
      throw AppError.unauthorized('Incorrect email or password')
    }
    return user
  },

  async getById(userId: string): Promise<IUser> {
    const user = await User.findById(userId)
    if (!user) {
      throw AppError.notFound('User not found')
    }
    return user
  },
}
