import { api } from './api'
import type { Question } from '@/types/question'

// Same envelope shape as authService.ts/interviewService.ts — the
// backend's sendSuccess always responds { success, message, data: {...} }.
interface ApiEnvelope<T> {
  success: boolean
  message: string
  data: T
}

interface BookmarkResponse {
  bookmarked: boolean
}

export const bookmarkService = {
  async bookmarkQuestion(questionId: string): Promise<boolean> {
    const { data } = await api.post<ApiEnvelope<BookmarkResponse>>(`/questions/${questionId}/bookmark`)
    return data.data.bookmarked
  },

  async removeBookmark(questionId: string): Promise<boolean> {
    const { data } = await api.delete<ApiEnvelope<BookmarkResponse>>(`/questions/${questionId}/bookmark`)
    return data.data.bookmarked
  },

  async getBookmarks(): Promise<Question[]> {
    const { data } = await api.get<ApiEnvelope<{ questions: Question[] }>>('/bookmarks')
    return data.data.questions
  },
}
