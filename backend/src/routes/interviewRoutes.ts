import { Router } from 'express'
import { interviewController } from '../controllers/interviewController'
import { questionController } from '../controllers/questionController'
import { requireAuth } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { createInterviewSchema, updateInterviewSchema } from '../validators/interviewValidators'

export const interviewRoutes = Router()

// Every interview route requires a logged-in user — applied once here with
// router.use, rather than repeated per-route as in authRoutes.ts, because
// (unlike auth) there are no public interview routes.
interviewRoutes.use(requireAuth)

interviewRoutes.post('/', validate(createInterviewSchema), interviewController.create)
interviewRoutes.get('/', interviewController.list)
interviewRoutes.get('/:id', interviewController.getOne)
interviewRoutes.put('/:id', validate(updateInterviewSchema), interviewController.update)

// Nested under /interviews rather than a separate top-level router: this is
// a single read endpoint scoped entirely by interview ownership, so it
// reuses the requireAuth already applied above instead of standing up a
// second router + app.use mount for one route.
interviewRoutes.get('/:id/questions', questionController.listForInterview)
