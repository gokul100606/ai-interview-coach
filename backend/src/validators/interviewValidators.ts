import { z } from 'zod'

const interviewTypeEnum = z.enum(['Technical', 'Behavioral', 'System Design', 'Mixed'])
const difficultyEnum = z.enum(['easy', 'medium', 'hard'])
const statusEnum = z.enum(['CREATED', 'IN_PROGRESS', 'COMPLETED', 'ABANDONED'])

export const createInterviewSchema = z.object({
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(100),
  interviewType: interviewTypeEnum,
  difficulty: difficultyEnum,
  questionCount: z.number().int().min(1).max(25),
  resumeId: z.string().trim().optional(),
})

export const updateInterviewSchema = z
  .object({
    status: statusEnum.optional(),
    startedAt: z.string().datetime().optional(),
    completedAt: z.string().datetime().optional(),
    overallScore: z.number().min(0).max(100).optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' })

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>