import { Router } from 'express'
import { authController } from '../controllers/authController'
import { validate } from '../middleware/validate'
import { registerSchema, loginSchema } from '../validators/authValidators'
import { requireAuth } from '../middleware/authMiddleware'
import { authLimiter } from '../middleware/rateLimiter'

export const authRoutes = Router()

authRoutes.post('/register', authLimiter, validate(registerSchema), authController.register)
authRoutes.post('/login', authLimiter, validate(loginSchema), authController.login)
authRoutes.post('/logout', authController.logout)
authRoutes.get('/me', requireAuth, authController.me)
