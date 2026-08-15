import { z } from 'zod'

// questionId's exact format (valid Mongo ObjectId) and existence are
// checked in answerService — mirrors how interview :id is handled
// elsewhere (see interviewService.getOwned): Zod only confirms shape here,
// the service layer owns "does this actually exist and is it mine".
export const submitAnswerSchema = z.object({
  questionId: z.string().trim().min(1, 'questionId is required'),
  answerText: z
    .string()
    .trim()
    .min(10, 'Answer must be at least 10 characters')
    .max(5000, 'Answer must be under 5000 characters'),
})

export type SubmitAnswerInput = z.infer<typeof submitAnswerSchema>
