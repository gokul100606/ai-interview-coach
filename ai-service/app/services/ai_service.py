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


GROQ_TIMEOUT_SECONDS = 15.0
GROQ_MAX_RETRIES = 1
EVALUATION_TEMPERATURE = 0.2


_client: Optional[AsyncGroq] = (
    AsyncGroq(
        api_key=settings.groq_api_key,
        timeout=GROQ_TIMEOUT_SECONDS,
        max_retries=GROQ_MAX_RETRIES,
    )
    if settings.groq_api_key
    else None
)


class AIService:

    def __init__(self) -> None:
        self._model = settings.groq_model

    # ============================================================
    # QUESTION GENERATION
    # ============================================================

    async def generate_questions(
        self,
        req: GenerateQuestionsRequest,
    ) -> List[GeneratedQuestion]:

        raw_text = await self._generate(
            self._build_question_prompt(req)
        )

        data = self._parse_json(raw_text)

        questions_raw = (
            data.get("questions")
            if isinstance(data, dict)
            else None
        )

        if not isinstance(questions_raw, list) or not questions_raw:
            raise ValueError(
                "The AI provider did not return a non-empty 'questions' array"
            )

        questions: List[GeneratedQuestion] = []

        for i, item in enumerate(
            questions_raw[: req.questionCount]
        ):
            try:
                if not isinstance(item, dict):
                    continue

                difficulty = item.get(
                    "difficulty",
                    req.difficulty,
                )

                if difficulty not in (
                    "easy",
                    "medium",
                    "hard",
                ):
                    difficulty = req.difficulty

                question_text = str(
                    item["questionText"]
                ).strip()

                if not question_text:
                    continue

                questions.append(
                    GeneratedQuestion(
                        questionText=question_text,
                        category=str(
                            item.get(
                                "category",
                                req.interviewType,
                            )
                        ),
                        topic=str(
                            item.get(
                                "topic",
                                req.role,
                            )
                        ),
                        difficulty=difficulty,
                        order=i + 1,
                        expectedTopics=[
                            str(t)
                            for t in item.get(
                                "expectedTopics",
                                [],
                            )
                        ],
                    )
                )

            except (
                KeyError,
                TypeError,
                ValueError,
            ) as exc:

                logger.warning(
                    "Skipping malformed question: %s",
                    exc,
                )

        if not questions:
            raise ValueError(
                "None of the AI provider's returned questions were valid"
            )

        return questions

    # ============================================================
    # ANSWER EVALUATION
    # ============================================================

    async def evaluate_answer(
        self,
        question: QuestionContext,
        answer_text: str,
    ) -> EvaluateAnswerResponse:

        raw_text = await self._generate(
            self._build_evaluation_prompt(
                question,
                answer_text,
            ),
            temperature=EVALUATION_TEMPERATURE,
        )

        data = self._parse_json(raw_text)

        if not isinstance(data, dict):
            raise ValueError(
                "The AI provider did not return a JSON object"
            )

        # Validate AI output using our own Pydantic schema.
        # This protects the backend even when the AI returns
        # unexpected or incomplete data.
        try:
            validated = AIEvaluationOutput(**data)

        except ValidationError as exc:

            logger.error(
                "AI evaluation validation failed: %s",
                exc,
            )

            raise ValueError(
                "The AI provider's evaluation response failed validation"
            ) from exc

        # Calculate overall score ourselves.
        # We never trust the AI to calculate this value.
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

    # ============================================================
    # GROQ REQUEST
    # ============================================================

    async def _generate(
        self,
        prompt: str,
        *,
        temperature: Optional[float] = None,
    ) -> str:

        if _client is None:
            raise ValueError(
                "AI service is not configured correctly"
            )

        kwargs: Dict[str, Any] = {
            "model": self._model,
            "messages": [
                {
                    "role": "user",
                    "content": prompt,
                }
            ],
        }

        if temperature is not None:
            kwargs["temperature"] = temperature

        try:

            response = await _client.chat.completions.create(
                **kwargs
            )

        except APITimeoutError as exc:

            logger.error(
                "Groq request timed out after %ss",
                GROQ_TIMEOUT_SECONDS,
            )

            raise ValueError(
                "Groq request timed out"
            ) from exc

        except RateLimitError as exc:

            logger.error(
                "Groq rate limit reached"
            )

            raise ValueError(
                "Groq rate limit reached - please try again shortly"
            ) from exc

        except APIStatusError as exc:

            logger.error(
                "Groq returned status %s: %s",
                exc.status_code,
                exc,
            )

            if exc.status_code >= 500:

                raise ValueError(
                    "Groq is temporarily unavailable - please try again shortly"
                ) from exc

            raise ValueError(
                "Groq request failed"
            ) from exc

        except APIConnectionError as exc:

            logger.error(
                "Could not reach Groq: %s",
                exc,
            )

            raise ValueError(
                "Could not reach Groq"
            ) from exc

        except APIError as exc:

            logger.error(
                "Groq request failed: %s",
                exc,
            )

            raise ValueError(
                "Groq request failed"
            ) from exc

        choices = getattr(
            response,
            "choices",
            None,
        )

        content = (
            choices[0].message.content
            if choices
            else None
        )

        if not content or not content.strip():

            raise ValueError(
                "Groq returned an empty response"
            )

        return content.strip()

    # ============================================================
    # JSON PARSER
    # ============================================================

    @staticmethod
    def _parse_json(
        raw_text: str,
    ) -> Any:

        try:

            return json.loads(raw_text)

        except json.JSONDecodeError as exc:

            logger.error(
                "Invalid JSON returned by Groq:",
            )

            raise ValueError(
                "The AI provider returned invalid JSON"
            ) from exc

    # ============================================================
    # QUESTION PROMPT
    # ============================================================

    @staticmethod
    def _build_question_prompt(
        req: GenerateQuestionsRequest,
    ) -> str:

        context_lines = [
            f"Role: {req.role}",
            f"Interview type: {req.interviewType}",
            f"Difficulty: {req.difficulty}",
            f"Number of questions required: {req.questionCount}",
        ]

        if req.skills:

            context_lines.append(
                f"Candidate skills: {', '.join(req.skills)}"
            )

        if req.candidateExperience:

            context_lines.append(
                f"Candidate experience: {req.candidateExperience}"
            )

        if req.resumeText:

            context_lines.append(
                f"Resume excerpt: {req.resumeText[:2000]}"
            )

        return (
            "You are generating interview questions for a "
            "technical interview practice platform.\n\n"

            + "\n".join(context_lines)

            + f"\n\nGenerate exactly {req.questionCount} "
            "distinct interview questions matching the role, "
            "interview type, and difficulty above.\n"

            "Do not repeat or closely paraphrase any question.\n\n"

            "Return ONLY valid JSON.\n"

            "The response MUST contain a 'questions' array.\n"

            "Each question MUST contain all of these fields:\n"
            "- questionText: string\n"
            "- category: string\n"
            "- topic: string\n"
            "- difficulty: easy, medium, or hard\n"
            "- expectedTopics: array of strings\n\n"

            "JSON format:\n"

            "{"
            '"questions":['
            "{"
            '"questionText":"string",'
            '"category":"string",'
            '"topic":"string",'
            '"difficulty":"easy",'
            '"expectedTopics":["string"]'
            "}"
            "]"
            "}\n\n"

            "No markdown.\n"
            "No code fences.\n"
            "No explanation.\n"
            "No commentary."
        )

    # ============================================================
    # EVALUATION PROMPT
    # ============================================================

    @staticmethod
    def _build_evaluation_prompt(
        question: QuestionContext,
        answer_text: str,
    ) -> str:

        expected = (
            ", ".join(question.expectedTopics)
            or "not specified"
        )

        return (
            "You are an expert technical interviewer evaluating "
            "ONE candidate answer to ONE interview question.\n\n"

            "QUESTION:\n"
            f"{question.questionText}\n\n"

            "CATEGORY:\n"
            f"{question.category}\n\n"

            "TOPIC:\n"
            f"{question.topic}\n\n"

            "DIFFICULTY:\n"
            f"{question.difficulty}\n\n"

            "EXPECTED TOPICS:\n"
            f"{expected}\n\n"

            "CANDIDATE ANSWER:\n"
            f"{answer_text}\n\n"

            "EVALUATION RULES:\n\n"

            "Evaluate ONLY what the candidate actually wrote.\n"
            "Do not assume information that was not provided.\n\n"

            "technicalAccuracyScore:\n"
            "Score whether the technical claims are correct.\n\n"

            "communicationScore:\n"
            "Score clarity, structure, and ease of understanding.\n\n"

            "relevanceScore:\n"
            "Score whether the answer directly addresses the question.\n\n"

            "completenessScore:\n"
            "Score whether the important parts of the question "
            "were answered.\n\n"

            "strengths:\n"
            "Give specific strengths based on the candidate's answer.\n\n"

            "weaknesses:\n"
            "Give specific weaknesses based on the candidate's answer.\n\n"

            "suggestions:\n"
            "Give concrete and actionable improvements.\n\n"

            "idealAnswer:\n"
            "Give a concise correct model answer to the question.\n\n"

            "IMPORTANT OUTPUT RULES:\n"

            "You MUST return ALL 8 fields.\n"
            "NEVER omit a field.\n"
            "Even if the candidate answer is very short, wrong, "
            "empty, or irrelevant, ALL 8 fields are required.\n\n"

            "technicalAccuracyScore MUST be an integer from 0 to 100.\n"
            "communicationScore MUST be an integer from 0 to 100.\n"
            "relevanceScore MUST be an integer from 0 to 100.\n"
            "completenessScore MUST be an integer from 0 to 100.\n\n"

            "strengths MUST contain at least 1 string.\n"
            "weaknesses MUST contain at least 1 string.\n"
            "suggestions MUST contain at least 1 string.\n"
            "idealAnswer MUST be a non-empty string.\n\n"

            "Return ONLY valid JSON.\n"
            "Do not use markdown.\n"
            "Do not use code fences.\n"
            "Do not add explanations.\n"
            "Do not add extra fields.\n\n"

            "Use exactly this JSON structure:\n"

            "{"
            '"technicalAccuracyScore":0,'
            '"communicationScore":0,'
            '"relevanceScore":0,'
            '"completenessScore":0,'
            '"strengths":["string"],'
            '"weaknesses":["string"],'
            '"suggestions":["string"],'
            '"idealAnswer":"string"'
            "}"
        )


ai_service = AIService()