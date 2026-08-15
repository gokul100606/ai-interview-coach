# AI Interview Coach — AI Service

A small FastAPI service that isolates all Gemini-specific logic behind two
endpoints. The Node/Express backend calls this service; nothing else does.

```
React  →  Node/Express  →  FastAPI  →  Gemini
```

The Gemini API key lives only here (`GEMINI_API_KEY`) — it is never sent to
the frontend and Node never talks to Gemini directly.

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

Edit `.env` and set `GEMINI_API_KEY` (get one from
https://aistudio.google.com/apikey). `GEMINI_MODEL` defaults to
`gemini-flash-latest`, an alias that always points at Google's current
stable Flash model — pin an exact dated model name instead if you need
fully reproducible behavior across model updates.

## Run

```powershell
uvicorn app.main:app --reload --port 8000
```

Then check `http://localhost:8000/health` and, once the Node backend is
pointed at `AI_SERVICE_URL=http://localhost:8000`, the full
create-interview / submit-answer flow will call through to Gemini.

## Notes

- CORS is intentionally not configured — this service is only ever called
  server-to-server by Node, never directly from a browser.
- If `GEMINI_API_KEY` is missing, both endpoints return a clean `502`
  instead of crashing — Node converts that into its existing error format
  for the frontend.
