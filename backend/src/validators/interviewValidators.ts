import { z } from 'zod'

// Mirrors the enums on the Interview Mongoose model exactly — see
// backend/src/models/Interview.ts. Keeping them in one place (the model)
// would require importing Mongoose here just for string unions, so we
// duplicate the literal lists and rely on the model as the source of truth.
const interviewTypeEnum = z.enum(['Technical', 'Behavioral', 'System Design', 'Mixed'])
const difficultyEnum = z.enum(['easy', 'medium', 'hard'])

export const createInterviewSchema = z.object({
  role: z.string().trim().min(2, 'Role must be at least 2 characters').max(100),
  interviewType: interviewTypeEnum,
  difficulty: difficultyEnum,
  questionCount: z.number().int().min(1).max(25),
  resumeId: z.string().trim().optional(),
})

/**
 * PUT /api/interviews/:id — Phase 10A security fix.
 *
 * status, startedAt, completedAt, and overallScore are deliberately NOT
 * accepted here. Those are server-controlled lifecycle/result fields
 * owned exclusively by answerService.advanceInterviewStatus (see
 * backend/src/services/answerService.ts) as answers are submitted and
 * evaluated by the AI service — never by a direct client request. Before
 * this fix, a client could PUT { "status": "COMPLETED", "overallScore":
 * 100 } directly and fabricate a perfect completed interview with no
 * questions ever answered and no AI evaluation ever run.
 *
 * Zod's default z.object() strips unrecognized keys rather than
 * rejecting them, so a request containing only those fields ends up as
 * an empty object after parsing and is caught by the .refine() below
 * ("provide at least one field"); a request that mixes them with a valid
 * resumeId has them stripped before req.body is ever set (see
 * middleware/validate.ts) — either way, status/overallScore/etc. never
 * reach the controller or service layer from this route.
 *
 * role/interviewType/difficulty/questionCount remain fixed at creation
 * time by design (unchanged from before this fix) and are not accepted
 * here either. resumeId is the only field left that is genuinely just
 * client-owned metadata with no bearing on scoring or interview state.
 */
export const updateInterviewSchema = z
  .object({
    resumeId: z.string().trim().min(1, 'resumeId cannot be empty').optional(),
  })
  .refine((data) => Object.keys(data).length > 0, { message: 'Provide at least one field to update' })

export type CreateInterviewInput = z.infer<typeof createInterviewSchema>
export type UpdateInterviewInput = z.infer<typeof updateInterviewSchema>
