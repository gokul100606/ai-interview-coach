import json
import logging
from typing import Any, List, Optional

from google import genai
from google.genai import types

from app.config import settings
from app.schemas import (
    EvaluateAnswerResponse,
    GeneratedQuestion,
    GenerateQuestionsRequest,
    QuestionContext,
)

logger = logging.getLogger("ai-service.gemini")

# Built once at import time. None when no API key is configured, so a
# misconfigured service fails with a clear message on first request rather
# than crashing at startup (useful for local dev without a key yet).
_client: Optional[genai.Client] = genai.Client(api_key=settings.gemini_api_key) if settings.gemini_api_key else None


class GeminiService:
    """
    Every Gemini-specific detail — SDK client, prompt text, raw-response
    parsing — lives in this one file. main.py and the rest of the FastAPI
    app only ever see GenerateQuestionsRequest/EvaluateAnswerResponse;
    nothing else imports google.genai. Swapping providers later means
    rewriting this file only.
    """

    def __init__(self) -> None:
        self._model = settings.gemini_model

    async def generate_questions(self, req: GenerateQuestionsRequest) -> List[GeneratedQuestion]:
        raw_text = await self._generate(self._build_question_prompt(req))
        data = self._parse_json(raw_text)

        questions_raw = data.get("questions") if isinstance(data, dict) else None
        if not isinstance(questions_raw, list) or not questions_raw:
            raise ValueError("Gemini did not return a non-empty 'questions' array")

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
                # it and keep whatever Gemini got right.
                logger.warning("Skipping malformed question from Gemini: %s", exc)

        if not questions:
            raise ValueError("None of Gemini's returned questions were valid")

        return questions

    async def evaluate_answer(self, question: QuestionContext, answer_text: str) -> EvaluateAnswerResponse:
        raw_text = await self._generate(self._build_evaluation_prompt(question, answer_text))
        data = self._parse_json(raw_text)

        if not isinstance(data, dict):
            raise ValueError("Gemini did not return a JSON object")

        try:
            return EvaluateAnswerResponse(
                technicalScore=data["technicalScore"],
                communicationScore=data["communicationScore"],
                relevanceScore=data["relevanceScore"],
                completenessScore=data["completenessScore"],
                overallScore=data["overallScore"],
                strengths=list(data.get("strengths", [])),
                weaknesses=list(data.get("weaknesses", [])),
                suggestions=list(data.get("suggestions", [])),
                idealAnswer=str(data.get("idealAnswer", "")),
            )
        except (KeyError, TypeError, ValueError) as exc:
            raise ValueError(f"Gemini's evaluation response was missing or had invalid fields: {exc}") from exc

    async def _generate(self, prompt: str) -> str:
        if _client is None:
            raise ValueError("GEMINI_API_KEY is not configured on the AI service")
        try:
            response = await _client.aio.models.generate_content(
                model=self._model,
                contents=prompt,
                config=types.GenerateContentConfig(response_mime_type="application/json"),
            )
        except Exception as exc:  # Gemini SDK errors: auth, rate limit, network, etc.
            logger.error("Gemini request failed: %s", exc)
            raise ValueError(f"Gemini request failed: {exc}") from exc

        text = getattr(response, "text", None)
        if not text:
            raise ValueError("Gemini returned an empty response")
        return text

    @staticmethod
    def _parse_json(raw_text: str) -> Any:
        try:
            return json.loads(raw_text)
        except json.JSONDecodeError as exc:
            raise ValueError(f"Gemini returned invalid JSON: {exc}") from exc

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
        expected = ", ".join(question.expectedTopics) or "N/A"
        return (
            "You are an expert technical interviewer evaluating a candidate's "
            "spoken answer.\n"
            f"Question: {question.questionText}\n"
            f"Category: {question.category}\n"
            f"Topic: {question.topic}\n"
            f"Difficulty: {question.difficulty}\n"
            f"Topics a strong answer would cover: {expected}\n"
            f"Candidate's answer: {answer_text}\n\n"
            "Score the answer on technicalScore, communicationScore, "
            "relevanceScore, and completenessScore, each an integer from 0 to "
            "100, and set overallScore to their rounded average. Provide 2-3 "
            "short strengths, 2-3 short weaknesses, 1-2 actionable suggestions, "
            "and a concise ideal answer.\n"
            "Respond with ONLY a JSON object of this exact shape:\n"
            '{"technicalScore": int, "communicationScore": int, '
            '"relevanceScore": int, "completenessScore": int, '
            '"overallScore": int, "strengths": string[], "weaknesses": '
            'string[], "suggestions": string[], "idealAnswer": string}\n'
            "No markdown, no code fences, no commentary — JSON only."
        )


gemini_service = GeminiService()
