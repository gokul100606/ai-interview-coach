import { Router } from 'express'
import { bookmarkController } from '../controllers/bookmarkController'
import { requireAuth } from '../middleware/authMiddleware'

export const questionRoutes = Router()

questionRoutes.use(requireAuth)

questionRoutes.post('/:id/bookmark', bookmarkController.add)
questionRoutes.delete('/:id/bookmark', bookmarkController.remove)
