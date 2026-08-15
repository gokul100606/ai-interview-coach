from fastapi import FastAPI, HTTPException

from app.schemas import (
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
)
from app.services.gemini_service import gemini_service

app = FastAPI(title="AI Interview Coach — AI Service", version="0.1.0")

# No CORSMiddleware here on purpose: this service is only ever called
# server-to-server by the Node backend (see Part 12 of the Phase 8 spec —
# "Frontend talks only to Node. Node talks to FastAPI."), never from a
# browser, so there's no cross-origin request to allow.


@app.get("/health")
def health():
    return {"success": True, "message": "AI service is running"}


@app.post("/api/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(payload: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
    try:
        questions = await gemini_service.generate_questions(payload)
    except ValueError as exc:
        # Malformed/empty Gemini output, missing API key, or a raw SDK
        # failure — all surfaced as a clean 502 rather than a raw
        # traceback. Node's questionGenerationService turns this into the
        # existing AppError format for the frontend.
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return GenerateQuestionsResponse(questions=questions)


@app.post("/api/evaluate-answer", response_model=EvaluateAnswerResponse)
async def evaluate_answer(payload: EvaluateAnswerRequest) -> EvaluateAnswerResponse:
    try:
        return await gemini_service.evaluate_answer(payload.question, payload.answerText)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
