import { Router } from 'express'
import { userController } from '../controllers/userController'
import { requireAuth } from '../middleware/authMiddleware'
import { validate } from '../middleware/validate'
import { updateUserSchema } from '../validators/userValidators'

export const userRoutes = Router()

userRoutes.use(requireAuth)
userRoutes.put('/me', validate(updateUserSchema), userController.updateMe)
