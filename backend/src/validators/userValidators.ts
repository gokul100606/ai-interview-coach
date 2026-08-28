import { z } from 'zod'

/**
 * PUT /api/users/me — an explicit allowlist, same shape as
 * updateInterviewSchema (interviewValidators.ts, Phase 10A): only fields
 * genuinely supported by the User model and actually editable in the
 * Profile/Settings UI are accepted. email and passwordHash are
 * deliberately absent — this endpoint has no path to changing either.
 */
export const updateUserSchema = z
  .object({
    name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100).optional(),
    targetRole: z.string().trim().max(100).optional(),
    preferences: z
      .object({
        emailDigest: z.boolean().optional(),
        practiceReminders: z.boolean().optional(),
      })
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' })

export type UpdateUserInput = z.infer<typeof updateUserSchema>
