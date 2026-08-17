# AI Interview Coach — AI Service

A small FastAPI service that isolates all AI-provider-specific logic
behind two endpoints. The Node/Express backend calls this service;
nothing else does.

```
React  →  Node/Express  →  FastAPI  →  Groq
```

The Groq API key lives only here (`GROQ_API_KEY`) — it is never sent to
the frontend and Node never talks to Groq directly.

> **Provider history:** this service originally used Gemini (Phase 8) and
> was migrated to Groq (Phase 9A). All provider-specific code lives in
> `app/services/ai_service.py` — nothing else in the app needs to change
> if the provider changes again.

## Endpoints

- `GET /health` — liveness check
- `POST /api/generate-questions` — generates a question set for an interview
- `POST /api/evaluate-answer` — scores one candidate answer

See `app/schemas.py` for the exact request/response shapes.

## Setup

```powershell
cd ai-service
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
copy .env.example .env
```

Edit `.env` and set `GROQ_API_KEY` (get one from
https://console.groq.com/keys). `GROQ_MODEL` defaults to
`openai/gpt-oss-20b`, a currently-available Groq model — check
https://console.groq.com/docs/deprecations before relying on any model
long-term, and change `GROQ_MODEL` if needed; nothing in the code
hardcodes a model name.

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Then check `http://localhost:8000/health` and, once the Node backend is
pointed at `AI_SERVICE_URL=http://localhost:8000`, the full
create-interview / submit-answer flow will call through to Groq.

## Notes

- CORS is intentionally not configured — this service is only ever called
  server-to-server by Node, never directly from a browser.
- If `GROQ_API_KEY` is missing, both endpoints return a clean `502`
  instead of crashing — Node converts that into its existing error format
  for the frontend.
- The Groq client is configured with a 15s timeout and 1 retry
  (`max_retries=1`) — bounded, not infinite. Rate limits (429) and
  transient 5xx errors are caught explicitly and surfaced as a clean 502
  to Node rather than crashing the process or hanging the request.
