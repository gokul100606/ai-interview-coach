import pytest
import httpx

from app.services.ai_service import AIService
import app.services.ai_service as ai_module


@pytest.mark.asyncio
async def test_generate_fails_when_groq_is_not_configured(monkeypatch):
    service = AIService()

    monkeypatch.setattr(ai_module, "_client", None)

    with pytest.raises(ValueError, match="not configured correctly"):
        await service._generate("test prompt")


@pytest.mark.asyncio
async def test_generate_rejects_empty_groq_response(monkeypatch):
    service = AIService()

    class FakeMessage:
        content = ""

    class FakeChoice:
        message = FakeMessage()

    class FakeResponse:
        choices = [FakeChoice()]

    class FakeCompletions:
        async def create(self, **kwargs):
            return FakeResponse()

    class FakeChat:
        completions = FakeCompletions()

    class FakeClient:
        chat = FakeChat()

    monkeypatch.setattr(ai_module, "_client", FakeClient())

    with pytest.raises(ValueError, match="empty response"):
        await service._generate("test prompt")


@pytest.mark.asyncio
async def test_generate_handles_timeout(monkeypatch):
    service = AIService()

    async def fake_create(self, **kwargs):
        raise ai_module.APITimeoutError(request=None)

    class FakeCompletions:
        create = fake_create

    class FakeChat:
        completions = FakeCompletions()

    class FakeClient:
        chat = FakeChat()

    monkeypatch.setattr(ai_module, "_client", FakeClient())

    with pytest.raises(ValueError, match="timed out"):
        await service._generate("test prompt")


@pytest.mark.asyncio
async def test_generate_handles_rate_limit(monkeypatch):
    service = AIService()

    async def fake_create(self, **kwargs):
        response = httpx.Response(
            429,
            request=httpx.Request("POST", "https://api.groq.com"),
    )

        raise ai_module.RateLimitError(
            message="rate limited",
            response=response,
            body=None,
        )

    class FakeCompletions:
        create = fake_create

    class FakeChat:
        completions = FakeCompletions()

    class FakeClient:
        chat = FakeChat()

    monkeypatch.setattr(ai_module, "_client", FakeClient())

    with pytest.raises(ValueError, match="rate limit"):
        await service._generate("test prompt")


@pytest.mark.asyncio
async def test_generate_handles_connection_error(monkeypatch):
    service = AIService()

    async def fake_create(self, **kwargs):
        raise ai_module.APIConnectionError(request=None)

    class FakeCompletions:
        create = fake_create

    class FakeChat:
        completions = FakeCompletions()

    class FakeClient:
        chat = FakeChat()

    monkeypatch.setattr(ai_module, "_client", FakeClient())

    with pytest.raises(ValueError, match="Could not reach Groq"):
        await service._generate("test prompt")