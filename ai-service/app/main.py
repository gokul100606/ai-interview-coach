import secrets

from fastapi import Depends, FastAPI, Header, HTTPException

from app.config import settings
from app.schemas import (
    EvaluateAnswerRequest,
    EvaluateAnswerResponse,
    GenerateQuestionsRequest,
    GenerateQuestionsResponse,
)
from app.services.ai_service import ai_service

app = FastAPI(title="AI Interview Coach — AI Service", version="0.1.0")

# No CORSMiddleware here on purpose: this service is only ever called
# server-to-server by the Node backend, never from a browser.


async def verify_internal_key(x_internal_key: str = Header(default=None, alias="X-Internal-Key")) -> None:
    """
    Phase 10H — rejects any request to the internal AI endpoints that
    doesn't carry the shared secret Node and this service both configure
    via AI_INTERNAL_KEY. Uses secrets.compare_digest for a constant-time
    comparison so response timing can't leak how much of the key a
    request got right.

    Applied only to the two AI endpoints via Depends() below — /health is
    deliberately left public, since deployment health-check probes
    commonly can't be configured to send custom headers and don't need
    access to anything sensitive.
    """
    if not settings.ai_internal_key:
        # Misconfigured service — fail closed rather than silently
        # accepting every request because no secret was ever set.
        raise HTTPException(status_code=500, detail="AI_INTERNAL_KEY is not configured on the AI service")
    if not x_internal_key or not secrets.compare_digest(x_internal_key, settings.ai_internal_key):
        raise HTTPException(status_code=401, detail="Missing or invalid internal key")


@app.get("/health")
def health():
    return {"success": True, "message": "AI service is running"}


@app.post(
    "/api/generate-questions",
    response_model=GenerateQuestionsResponse,
    dependencies=[Depends(verify_internal_key)],
)
async def generate_questions(payload: GenerateQuestionsRequest) -> GenerateQuestionsResponse:
    try:
        questions = await ai_service.generate_questions(payload)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc
    return GenerateQuestionsResponse(questions=questions)


@app.post(
    "/api/evaluate-answer",
    response_model=EvaluateAnswerResponse,
    dependencies=[Depends(verify_internal_key)],
)
async def evaluate_answer(payload: EvaluateAnswerRequest) -> EvaluateAnswerResponse:
    try:
        return await ai_service.evaluate_answer(payload.question, payload.answerText)
    except ValueError as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc