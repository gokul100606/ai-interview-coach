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

    gemini_api_key: str = os.getenv("GEMINI_API_KEY", "")
    # "gemini-flash-latest" auto-tracks Google's current stable Flash
    # model rather than pinning a dated version that may be deprecated —
    # see ai-service/.env.example for why.
    gemini_model: str = os.getenv("GEMINI_MODEL", "gemini-flash-latest")
    port: int = int(os.getenv("PORT", "8000"))


settings = Settings()
