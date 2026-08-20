import { Router } from 'express'
import { bookmarkController } from '../controllers/bookmarkController'
import { requireAuth } from '../middleware/authMiddleware'

export const bookmarkRoutes = Router()

bookmarkRoutes.use(requireAuth)

bookmarkRoutes.get('/', bookmarkController.list)
