import { Router } from 'express'

export const healthRoutes = Router()

healthRoutes.get('/health', (_req, res) => {
  res.status(200).json({ success: true, message: 'AI Interview Coach API is running' })
})
