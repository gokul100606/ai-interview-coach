import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    """
    Single source of truth for AI-service environment variables, mirroring
    the pattern used on the Node side (backend/src/config/env.ts): read
    once here, everything else imports `settings` instead of touching
    os.environ directly.
    """

    groq_api_key: str = os.getenv("GROQ_API_KEY", "")
    # "openai/gpt-oss-20b" is a currently-available Groq model — check
    # https://console.groq.com/docs/deprecations before relying on any
    # model long-term. Nothing in the code hardcodes a model name.
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    port: int = int(os.getenv("PORT", "8000"))
    # Phase 10H — shared secret validated against the X-Internal-Key header
    # on every request to the two AI endpoints. Must match backend/.env's
    # AI_INTERNAL_KEY exactly.
    ai_internal_key: str = os.getenv("AI_INTERNAL_KEY", "")


settings = Settings()