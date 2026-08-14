# AI Interview Coach

> Practice smarter. Interview better. Get hired.

A personalized AI-powered interview preparation platform. This repo is being built in phases —
see `docs/progress.md` for what's implemented so far.

## Structure
- `frontend/` — React + Vite + TypeScript + Tailwind (Phase 1: ✅ scaffolded, mock-data-driven)
- `backend/` — Node + Express + MongoDB (not yet implemented — Phase 6+)
- `ai-service/` — FastAPI + Gemini (not yet implemented — Phase 8+)
- `docs/` — architecture & API docs (added as each phase lands)

## Running the frontend (Phase 1)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173. The app runs fully on mock data right now — no backend required yet.
Register/login accept any email+password (mocked), and the full interview flow
(setup → room → evaluation → report) is clickable end to end.
