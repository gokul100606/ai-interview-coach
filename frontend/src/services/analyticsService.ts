import { api } from './api'
import type { DashboardData } from '@/types/dashboard'

// Same envelope shape as authService.ts/interviewService.ts — the
// backend's sendSuccess always responds { success, message, data: {...} }.
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

export const analyticsService = {
  async getDashboard(): Promise<DashboardData> {
    const { data } = await api.get<ApiEnvelope<{ dashboard: DashboardData }>>('/analytics/dashboard')
    return data.data.dashboard
  },
}
