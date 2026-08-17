import asyncio
import json
import logging
from typing import Any, Dict, List, Optional

from pydantic import ValidationError

from groq import (
    AsyncGroq,
    APIConnectionError,
    APIError,
    APIStatusError,
    APITimeoutError,
    RateLimitError,
)

from app.config import settings
from app.schemas import (
    AIEvaluationOutput,
    EvaluateAnswerResponse,
    GeneratedQuestion,
    GenerateQuestionsRequest,
    QuestionContext,
)

logger = logging.getLogger("ai-service.groq")

# Client-level timeout — the Groq SDK (Stainless-generated, same shape as
# the OpenAI SDK) enforces this itself and raises APITimeoutError, so no
# manual asyncio.wait_for wrapper is needed here (unlike the old Gemini
# integration, whose SDK didn't expose an equivalent constructor option).
GROQ_TIMEOUT_SECONDS = 15.0

# "At most one short retry" per the migration spec — the SDK's own bounded
# exponential-backoff retry (built in, not hand-rolled) already covers
# connection errors, 429s, and 5xxs; this just caps it at 1 attempt beyond
# the first instead of the client's own default of 2.
GROQ_MAX_RETRIES = 1

# Low but non-zero: consistent, less erratic scoring across near-identical
# answers (Requirement 5) without the occasional degenerate/repetitive
# output that temperature=0 can produce on some models. Only applied to
# evaluation — question generation keeps the SDK default, unchanged from
# Phase 8/9, since Requirement 5 scopes this to evaluation consistency.
EVALUATION_TEMPERATURE = 0.2

# Built once at import time. None when no API key is configured, so a
# misconfigured service fails with a clear message on first request rather
# than crashing at startup (useful for local dev without a key yet).
_client: Optional[AsyncGroq] = (
    AsyncGroq(api_key=settings.groq_api_key, timeout=GROQ_TIMEOUT_SECONDS, max_retries=GROQ_MAX_RETRIES)
    if settings.groq_api_key
    else None
)


class AIService:
    """
    Every provider-specific detail — SDK client, prompt text, raw-response
    parsing — lives in this one file. main.py and the rest of the FastAPI
    app only ever see GenerateQuestionsRequest/EvaluateAnswerResponse;
    nothing else imports the groq package. This file replaces the old
    gemini_service.py (Phase 9A: migrated from Gemini to Groq) — the class
    and module were renamed to be provider-neutral so a future provider
    swap doesn't leave a stale name behind again.
    """

    def __init__(self) -> None:
        self._model = settings.groq_model

    async def generate_questions(self, req: GenerateQuestionsRequest) -> List[GeneratedQuestion]:
        raw_text = await self._generate(self._build_question_prompt(req))
        data = self._parse_json(raw_text)

        questions_raw = data.get("questions") if isinstance(data, dict) else None
        if not isinstance(questions_raw, list) or not questions_raw:
            raise ValueError("The AI provider did not return a non-empty 'questions' array")

        questions: List[GeneratedQuestion] = []
        for i, item in enumerate(questions_raw[: req.questionCount]):
            try:
                difficulty = item.get("difficulty", req.difficulty)
                if difficulty not in ("easy", "medium", "hard"):
                    difficulty = req.difficulty
                questions.append(
                    GeneratedQuestion(
                        questionText=str(item["questionText"]).strip(),
                        category=str(item.get("category", req.interviewType)),
                        topic=str(item.get("topic", req.role)),
                        difficulty=difficulty,
                        order=i + 1,
                        expectedTopics=[str(t) for t in item.get("expectedTopics", [])],
                    )
                )
            except (KeyError, TypeError, ValueError) as exc:
                # One malformed item shouldn't sink the whole batch — skip
                # it and keep whatever the model got right.
                logger.warning("Skipping malformed question from AI provider: %s", exc)

        if not questions:
            raise ValueError("None of the AI provider's returned questions were valid")

        return questions

    async def evaluate_answer(self, question: QuestionContext, answer_text: str) -> EvaluateAnswerResponse:
        raw_text = await self._generate(
            self._build_evaluation_prompt(question, answer_text),
            temperature=EVALUATION_TEMPERATURE,
        )
        data = self._parse_json(raw_text)

        if not isinstance(data, dict):
            raise ValueError("The AI provider did not return a JSON object")

        # Strict validation against AIEvaluationOutput catches every case
        # Requirement 4 lists: missing fields, wrong types, scores outside
        # 0-100, empty/missing arrays, unexpected extra fields. A
        # ValidationError here is deliberately turned into a plain
        # ValueError — main.py's existing except ValueError -> 502 handler
        # covers it with no new error-handling machinery.
        try:
            validated = AIEvaluationOutput(**data)
        except ValidationError as exc:
            raise ValueError(f"The AI provider's evaluation response failed validation: {exc}") from exc

        # overallScore is computed here, not trusted from the model's own
        # arithmetic — see the AIEvaluationOutput docstring in schemas.py
        # for why. Field names below map onto the UNCHANGED Node-facing
        # contract from Phase 8.
        overall = round(
            (
                validated.technicalAccuracyScore
                + validated.communicationScore
                + validated.relevanceScore
                + validated.completenessScore
            )
            / 4
        )

        return EvaluateAnswerResponse(
            technicalScore=validated.technicalAccuracyScore,
            communicationScore=validated.communicationScore,
            relevanceScore=validated.relevanceScore,
            completenessScore=validated.completenessScore,
            overallScore=overall,
            strengths=validated.strengths,
            weaknesses=validated.weaknesses,
            suggestions=validated.suggestions,
            idealAnswer=validated.idealAnswer,
        )

    async def _generate(self, prompt: str, *, temperature: Optional[float] = None) -> str:
        if _client is None:
            raise ValueError("GROQ_API_KEY is not configured on the AI service")

        kwargs: Dict[str, Any] = {
            "model": self._model,
            "messages": [{"role": "user", "content": prompt}],
            # JSON Object Mode — broadly supported across Groq chat
            # models (unlike stricter json_schema mode, which only some
            # models support), paired with an explicit shape in the
            # prompt text and full Pydantic validation afterward. Every
            # prompt below contains the literal word "JSON", which the
            # API requires when this mode is enabled.
            "response_format": {"type": "json_object"},
        }
        if temperature is not None:
            kwargs["temperature"] = temperature

        try:
            response = await _client.chat.completions.create(**kwargs)
        except APITimeoutError as exc:
            logger.error("Groq request timed out after %ss", GROQ_TIMEOUT_SECONDS)
            raise ValueError("Groq request timed out") from exc
        except RateLimitError as exc:
            logger.error("Groq rate limit reached: %s", exc)
            raise ValueError("Groq rate limit reached — please try again shortly") from exc
        except APIStatusError as exc:
            logger.error("Groq returned an error status %s: %s", exc.status_code, exc)
            if exc.status_code >= 500:
                raise ValueError("Groq is temporarily unavailable — please try again shortly") from exc
            raise ValueError(f"Groq request failed: {exc}") from exc
        except APIConnectionError as exc:
            logger.error("Could not reach Groq: %s", exc)
            raise ValueError("Could not reach Groq") from exc
        except APIError as exc:
            # Catch-all for any other Groq SDK error (including
            # AuthenticationError, a subclass of APIStatusError covering a
            # missing/invalid key) — never surfaces the key itself.
            logger.error("Groq request failed: %s", exc)
            raise ValueError(f"Groq request failed: {exc}") from exc

        choices = getattr(response, "choices", None)
        content = choices[0].message.content if choices else None
        if not content:
            raise ValueError("Groq returned an empty response")
        return content

    @staticmethod
    def _parse_json(raw_text: str) -> Any:
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise ValueError(f"The AI provider returned invalid JSON: {exc}") from exc

    @staticmethod
    def _build_question_prompt(req: GenerateQuestionsRequest) -> str:
        context_lines = [
            f"Role: {req.role}",
            f"Interview type: {req.interviewType}",
            f"Difficulty: {req.difficulty}",
            f"Number of questions required: {req.questionCount}",
        ]
        if req.skills:
            context_lines.append(f"Candidate skills: {', '.join(req.skills)}")
        if req.candidateExperience:
            context_lines.append(f"Candidate experience: {req.candidateExperience}")
        if req.resumeText:
            context_lines.append(f"Resume excerpt: {req.resumeText[:2000]}")

        return (
            "You are generating interview questions for a technical interview "
            "practice platform.\n"
            + "\n".join(context_lines)
            + f"\n\nGenerate exactly {req.questionCount} distinct interview questions "
            "matching the role, interview type, and difficulty above. Do not repeat "
            "or closely paraphrase any question.\n"
            "Respond with ONLY a JSON object of this exact shape:\n"
            '{"questions": [{"questionText": string, "category": string, '
            '"topic": string, "difficulty": "easy"|"medium"|"hard", '
            '"expectedTopics": string[]}]}\n'
            "No markdown, no code fences, no commentary — JSON only."
        )

    @staticmethod
    def _build_evaluation_prompt(question: QuestionContext, answer_text: str) -> str:
        expected = ", ".join(question.expectedTopics) or "not specified"
        return (
            "You are an expert technical interviewer scoring ONE candidate's "
            "answer to ONE interview question. Evaluate strictly and "
            "consistently — do not be generous by default and do not be "
            "harsh without a clear reason.\n\n"
            "=== Question being answered ===\n"
            f"Question: {question.questionText}\n"
            f"Category: {question.category}\n"
            f"Topic: {question.topic}\n"
            f"Difficulty: {question.difficulty}\n"
            f"Topics a strong answer would cover: {expected}\n\n"
            "=== Candidate's answer ===\n"
            f"{answer_text}\n\n"
            "=== How to evaluate ===\n"
            "- Evaluate ONLY the submitted answer above — do not assume "
            "anything about the candidate beyond what they actually wrote, "
            "and do not invent facts, experience, or context they did not "
            "state.\n"
            "- Compare the answer directly against the question asked and, "
            "when provided, the expected topics — do not evaluate it as a "
            "generic essay on the subject.\n"
            "- technicalAccuracyScore: is what the candidate said "
            "technically correct? Identify any incorrect technical claims "
            "explicitly. A short answer with correct, precise information "
            "should score well. A long, detailed answer that contains "
            "incorrect technical claims should lose significant points "
            "here even though it is thorough — do not reward length or "
            "confident tone in place of correctness, and do not heavily "
            "penalize a short answer just for being short if it is "
            "correct and sufficiently complete.\n"
            "- communicationScore: is separate from technical accuracy — "
            "judge clarity, structure, and how easy the answer is to "
            "follow, independent of whether the content itself is correct.\n"
            "- relevanceScore: does the answer actually address what this "
            "specific question asked? An answer that is well-written and "
            "technically correct but about the wrong topic should score "
            "low here.\n"
            "- completenessScore: judge against what THIS question "
            "realistically requires (and the expected topics above, if "
            "given) — not an exhaustive textbook chapter. A concise answer "
            "that covers what the question needs is complete; a long "
            "answer that still misses key parts of what was asked is not.\n"
            "- If the answer does not address the question at all, "
            "relevance and completeness should both be scored low, "
            "regardless of how well-written or long it is.\n"
            "- Do not give inflated scores as a default, and do not give "
            "extremely low scores (under ~20) unless the answer is "
            "genuinely empty, incoherent, or entirely off-topic — a "
            "flawed-but-genuine attempt deserves partial credit.\n"
            "- strengths/weaknesses must be specific to what this candidate "
            "actually wrote, not generic interview advice.\n"
            "- suggestions must be concrete and actionable — something the "
            "candidate could specifically do differently next time.\n"
            "- idealAnswer should be a concise model answer to THIS "
            "question, at a level appropriate for the stated difficulty.\n\n"
            "Respond with ONLY a JSON object of this exact shape — no "
            "other fields, no markdown, no code fences, no commentary:\n"
            '{"technicalAccuracyScore": int, "communicationScore": int, '
            '"relevanceScore": int, "completenessScore": int, '
            '"strengths": string[], "weaknesses": string[], '
            '"suggestions": string[], "idealAnswer": string}\n'
            "Each score is an integer from 0 to 100. strengths, weaknesses, "
            "and suggestions should each have 1-5 concise, useful items."
        )


ai_service = AIService()
