import { Router } from 'express'
import { interviewController } from '../controllers/interviewController'
import { requireAuth } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { createInterviewSchema, updateInterviewSchema } from '../validators/interviewValidators'

export const interviewRoutes = Router()

interviewRoutes.use(requireAuth)

interviewRoutes.post('/', validate(createInterviewSchema), interviewController.create)
interviewRoutes.get('/', interviewController.list)
interviewRoutes.get('/:id', interviewController.getOne)
interviewRoutes.put('/:id', validate(updateInterviewSchema), interviewController.update)