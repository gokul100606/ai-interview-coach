import { User, IUser } from '../models/User'
import { AppError } from '../utils/AppError'
import type { UpdateUserInput } from '../validators/userValidators'

export const userService = {
  /**
   * PUT /api/users/me — explicit allowlist, same defense-in-depth style
   * as interviewService.update() (Phase 10A): only ever reads the exact
   * fields named here off `input`, never spreads/Object.assigns the whole
   * body. passwordHash, email, and every other User field are simply
   * never read here, regardless of what updateUserSchema might accept
   * upstream — so even a future loosening of that schema couldn't let
   * this function start writing something it doesn't explicitly name.
   */
  async updateProfile(userId: string, input: UpdateUserInput): Promise<IUser> {
    const user = await User.findById(userId)
    if (!user) {
      throw AppError.notFound('User not found')
    }

    if (input.name !== undefined) user.name = input.name
    if (input.targetRole !== undefined) user.targetRole = input.targetRole
    if (input.preferences?.emailDigest !== undefined) {
      user.preferences.emailDigest = input.preferences.emailDigest
    }
    if (input.preferences?.practiceReminders !== undefined) {
      user.preferences.practiceReminders = input.preferences.practiceReminders
    }

    await user.save()
    return user
  },
}
