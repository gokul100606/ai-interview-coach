export interface Question {
  id: string
  interviewId: string
  questionText: string
  category: string
  topic: string
  difficulty: 'easy' | 'medium' | 'hard'
  order: number
  expectedTopics: string[]
  bookmarked?: boolean
}
