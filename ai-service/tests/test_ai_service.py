import pytest
from fastapi.testclient import TestClient

from app.main import app
from app.services.ai_service import AIService


client = TestClient(app)

VALID_KEY = "test-internal-key"


def test_health_endpoint():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["success"] is True


def test_generate_questions_requires_internal_key():
    response = client.post(
        "/api/generate-questions",
        json={
            "role": "Frontend Developer",
            "interviewType": "Technical",
            "difficulty": "medium",
            "questionCount": 2,
        },
    )

    assert response.status_code == 401


def test_evaluate_answer_requires_internal_key():
    response = client.post(
        "/api/evaluate-answer",
        json={
            "question": {
                "questionText": "What is React?",
                "category": "Technical",
                "topic": "React",
                "difficulty": "medium",
                "expectedTopics": ["components", "state"],
            },
            "answerText": "React is a JavaScript library for building user interfaces.",
        },
    )

    assert response.status_code == 401


def test_parse_json_valid_response():
    raw = '{"questions": [{"questionText": "What is React?"}]}'

    result = AIService._parse_json(raw)

    assert result["questions"][0]["questionText"] == "What is React?"


def test_parse_json_rejects_invalid_json():
    with pytest.raises(ValueError, match="invalid JSON"):
        AIService._parse_json("this is not json")


@pytest.mark.asyncio
async def test_generate_questions_parses_valid_ai_response(monkeypatch):
    service = AIService()

    async def fake_generate(prompt, *, temperature=None):
        return """
        {
            "questions": [
                {
                    "questionText": "What is React?",
                    "category": "Technical",
                    "topic": "React",
                    "difficulty": "medium",
                    "expectedTopics": ["components", "state"]
                },
                {
                    "questionText": "What is useEffect?",
                    "category": "Technical",
                    "topic": "React",
                    "difficulty": "medium",
                    "expectedTopics": ["side effects"]
                }
            ]
        }
        """

    monkeypatch.setattr(service, "_generate", fake_generate)

    from app.schemas import GenerateQuestionsRequest

    request = GenerateQuestionsRequest(
        role="Frontend Developer",
        interviewType="Technical",
        difficulty="medium",
        questionCount=2,
    )

    questions = await service.generate_questions(request)

    assert len(questions) == 2
    assert questions[0].questionText == "What is React?"
    assert questions[0].order == 1
    assert questions[1].order == 2


@pytest.mark.asyncio
async def test_generate_questions_rejects_empty_questions(monkeypatch):
    service = AIService()

    async def fake_generate(prompt, *, temperature=None):
        return '{"questions": []}'

    monkeypatch.setattr(service, "_generate", fake_generate)

    from app.schemas import GenerateQuestionsRequest

    request = GenerateQuestionsRequest(
        role="Frontend Developer",
        interviewType="Technical",
        difficulty="medium",
        questionCount=2,
    )

    with pytest.raises(ValueError, match="non-empty"):
        await service.generate_questions(request)


@pytest.mark.asyncio
async def test_evaluate_answer_calculates_overall_score(monkeypatch):
    service = AIService()

    async def fake_generate(prompt, *, temperature=None):
        assert temperature == 0.2

        return """
        {
            "technicalAccuracyScore": 80,
            "communicationScore": 90,
            "relevanceScore": 70,
            "completenessScore": 60,
            "strengths": ["Clear explanation"],
            "weaknesses": ["Missing one important point"],
            "suggestions": ["Add more technical detail"],
            "idealAnswer": "A concise correct answer."
        }
        """

    monkeypatch.setattr(service, "_generate", fake_generate)

    from app.schemas import QuestionContext

    question = QuestionContext(
        questionText="What is React?",
        category="Technical",
        topic="React",
        difficulty="medium",
        expectedTopics=["components", "state"],
    )

    result = await service.evaluate_answer(
        question,
        "React is a JavaScript library.",
    )

    assert result.technicalScore == 80
    assert result.communicationScore == 90
    assert result.relevanceScore == 70
    assert result.completenessScore == 60
    assert result.overallScore == 75


@pytest.mark.asyncio
async def test_evaluate_answer_rejects_invalid_ai_output(monkeypatch):
    service = AIService()

    async def fake_generate(prompt, *, temperature=None):
        return """
        {
            "technicalAccuracyScore": 150,
            "communicationScore": 90,
            "relevanceScore": 70,
            "completenessScore": 60,
            "strengths": ["Clear explanation"],
            "weaknesses": ["Missing details"],
            "suggestions": ["Improve"],
            "idealAnswer": "Answer"
        }
        """

    monkeypatch.setattr(service, "_generate", fake_generate)

    from app.schemas import QuestionContext

    question = QuestionContext(
        questionText="What is React?",
        category="Technical",
        topic="React",
        difficulty="medium",
        expectedTopics=["components"],
    )

    with pytest.raises(ValueError, match="failed validation"):
        await service.evaluate_answer(
            question,
            "React is a library.",
        )