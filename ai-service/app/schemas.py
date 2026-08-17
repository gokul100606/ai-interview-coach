from typing import List, Literal, Optional

from pydantic import BaseModel, ConfigDict, Field, field_validator

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


class AIEvaluationOutput(BaseModel):
    """
    Strict schema for the AI provider's RAW evaluation output — this is
    what the prompt asks the model to produce and what gets validated
    before anything is trusted (Phase 9, Requirement 3/4; unchanged by the
    Phase 9A Gemini->Groq migration). It intentionally does NOT include
    overallScore: that's computed deterministically in ai_service.py from
    these four validated scores rather than trusted from the model's own
    arithmetic (Requirement 5 — more deterministic where it's easy to be).
    `extra="forbid"` means an unexpected field fails validation rather
    than being silently accepted, per Requirement 3 ("do not allow
    arbitrary extra fields").

    This is intentionally a SEPARATE model from EvaluateAnswerResponse
    below, which is the existing Node-facing contract from Phase 8 and is
    left completely unchanged so answerEvaluationService.ts on the Node
    side needs no changes at all — including across this provider swap.
    """

    model_config = ConfigDict(extra="forbid")

    technicalAccuracyScore: int = Field(ge=0, le=100)
    communicationScore: int = Field(ge=0, le=100)
    relevanceScore: int = Field(ge=0, le=100)
    completenessScore: int = Field(ge=0, le=100)
    strengths: List[str]
    weaknesses: List[str]
    suggestions: List[str]
    idealAnswer: str = Field(min_length=1)

    @field_validator("strengths", "weaknesses", "suggestions")
    @classmethod
    def _clean_and_bound_list(cls, v: List[str]) -> List[str]:
        # "1-5 useful items" (Requirement 3): drop blanks, then cap at 5
        # rather than hard-rejecting a slightly-too-generous list — an
        # extra item is not a reason to throw away an otherwise-valid
        # evaluation, but zero usable items after cleaning is.
        cleaned = [s.strip() for s in v if isinstance(s, str) and s.strip()]
        if not cleaned:
            raise ValueError("must contain at least one non-empty item")
        return cleaned[:5]

    @field_validator("idealAnswer")
    @classmethod
    def _ideal_answer_not_blank(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("idealAnswer must not be blank")
        return v


class EvaluateAnswerResponse(BaseModel):
    # Unchanged Node-facing contract from Phase 8 — do not rename these
    # fields; backend/src/services/answerEvaluationService.ts parses them
    # by these exact names and nothing there changed this phase.
    technicalScore: int = Field(ge=0, le=100)
    communicationScore: int = Field(ge=0, le=100)
    relevanceScore: int = Field(ge=0, le=100)
    completenessScore: int = Field(ge=0, le=100)
    overallScore: int = Field(ge=0, le=100)
    strengths: List[str] = Field(default_factory=list)
    weaknesses: List[str] = Field(default_factory=list)
    suggestions: List[str] = Field(default_factory=list)
    idealAnswer: str = ""
