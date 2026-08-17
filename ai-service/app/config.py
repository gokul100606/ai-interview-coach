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
    # openai/gpt-oss-20b: OpenAI's open-weight model served on Groq —
    # confirmed current and actively recommended by Groq's own docs as of
    # this migration (Aug 2026), including as the suggested replacement
    # for several models Groq has since deprecated. Configurable so a
    # future model change doesn't require touching code.
    groq_model: str = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    port: int = int(os.getenv("PORT", "8000"))


settings = Settings()
