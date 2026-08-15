import { Router } from 'express'
import { interviewController } from '../controllers/interviewController'
import { questionController } from '../controllers/questionController'
import { answerController } from '../controllers/answerController'
import { requireAuth } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { createInterviewSchema, updateInterviewSchema } from '../validators/interviewValidators'
import { submitAnswerSchema } from '../validators/answerValidators'

export const interviewRoutes = Router()

// Every interview route requires a logged-in user — applied once here with
// router.use, rather than repeated per-route as in authRoutes.ts, because
// (unlike auth) there are no public interview routes.
interviewRoutes.use(requireAuth)

interviewRoutes.post('/', validate(createInterviewSchema), interviewController.create)
interviewRoutes.get('/', interviewController.list)
interviewRoutes.get('/:id', interviewController.getOne)
interviewRoutes.put('/:id', validate(updateInterviewSchema), interviewController.update)

// Nested under /interviews rather than a separate top-level router: these
// are single-purpose endpoints scoped entirely by interview ownership, so
// they reuse the requireAuth already applied above instead of standing up
// a second router + app.use mount per resource.
interviewRoutes.get('/:id/questions', questionController.listForInterview)
interviewRoutes.post('/:id/answers', validate(submitAnswerSchema), answerController.submit)
