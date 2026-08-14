export interface TopicPerformance {
  topic: string
  score: number
}

export interface RoadmapDay {
  day: number
  focus: string
  tasks: string[]
}

export interface Result {
  id: string
  interviewId: string
  overallScore: number
  technicalScore: number
  communicationScore: number
  relevanceScore: number
  completenessScore: number
  topicPerformance: TopicPerformance[]
  strengths: string[]
  weaknesses: string[]
  recommendations: string[]
  studyRoadmap: RoadmapDay[]
  createdAt: string
}
