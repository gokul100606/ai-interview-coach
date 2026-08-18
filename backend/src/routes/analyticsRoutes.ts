import { Router } from 'express'
import { analyticsController } from '../controllers/analyticsController'
import { requireAuth } from '../middleware/authMiddleware'

export const analyticsRoutes = Router()

// No :userId param anywhere on purpose (see Phase 10B spec) — the only
// identity source for every route in this router is the verified JWT.
analyticsRoutes.use(requireAuth)

analyticsRoutes.get('/dashboard', analyticsController.getDashboard)
