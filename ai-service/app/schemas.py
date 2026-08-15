from typing import List, Literal, Optional

from pydantic import BaseModel, Field

Difficulty = Literal["easy", "medium", "hard"]


# ---------------------------------------------------------------------------
# POST /api/generate-questions
# ---------------------------------------------------------------------------


class GenerateQuestionsRequest(BaseModel):
    role: str
    interviewType: str
    difficulty: Difficulty
    questionCount: int = Field(gt=0, le=25)
    # Optional context for future personalization (resume parsing isn't
    # implemented yet on the Node/frontend side — see Phase 8 notes — so
    # these are accepted but typically absent for now).
    resumeText: Optional[str] = None
    candidateExperience: Optional[str] = None
    skills: Optional[List[str]] = None


class GeneratedQuestion(BaseModel):
    questionText: str
    category: str
    topic: str
    difficulty: Difficulty
    order: int
    expectedTopics: List[str] = Field(default_factory=list)


class GenerateQuestionsResponse(BaseModel):
    questions: List[GeneratedQuestion]


# ---------------------------------------------------------------------------
# POST /api/evaluate-answer
# ---------------------------------------------------------------------------


class QuestionContext(BaseModel):
    questionText: str
    category: str
    topic: str
    difficulty: Difficulty
    expectedTopics: List[str] = Field(default_factory=list)


class EvaluateAnswerRequest(BaseModel):
    question: QuestionContext
    answerText: str = Field(min_length=1)


class EvaluateAnswerResponse(BaseModel):
    technicalScore: int = Field(ge=0, le=100)
    communicationScore: int = Field(ge=0, le=100)
    relevanceScore: int = Field(ge=0, le=100)
    completenessScore: int = Field(ge=0, le=100)
    overallScore: int = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    idealAnswer: str = ""
