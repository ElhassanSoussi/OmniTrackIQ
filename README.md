## OmniTrackIQ Monorepo

Stack: Next.js (App Router, TypeScript, Tailwind, React Query) frontend, FastAPI + SQLAlchemy/Alembic backend, PostgreSQL, n8n for ETL/alerts, and Stripe for billing.

### Structure
- `frontend/` — Next.js app (marketing, auth, dashboard).
- `backend/` — FastAPI service (auth, metrics, integrations, billing).
- `n8n-flows/` — Exported n8n workflow JSON files.
- `.env.example` — Shared env template; copy to `.env` or per-app envs.

### Backend — local setup
1) **Env vars:** From repo root run `cp .env.example backend/.env` and fill required values (`DATABASE_URL`, `JWT_SECRET_KEY`, `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`). Provider OAuth keys are optional.
2) **Database:** Start Postgres (e.g., `postgresql://user:password@localhost:5432/omnitrackiq`). Ensure the same URL is in `backend/.env`.
3) **Install:** `cd backend && python3 -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt`.
4) **Migrate:** `alembic upgrade head` (uses `DATABASE_URL`).
5) **Run API:** `uvicorn app.main:app --reload --host 0.0.0.0 --port 8000`. CORS allows `http://localhost:3000` by default.

### Frontend — local setup
1) **Env vars:** In `frontend/.env.local` set `NEXT_PUBLIC_API_URL=http://localhost:8000`.
2) **Install:** `cd frontend && npm install` (no lockfile present; npm assumed).
3) **Run dev server:** `npm run dev` (Next.js on port 3000). For production: `npm run build` then `npm run start`; lint with `npm run lint`.

### n8n flows — local setup
1) **Run n8n (Docker example):** `docker run -it --rm -p 5678:5678 -v $(pwd)/n8n-data:/home/node/.n8n n8nio/n8n`. Point it to your Postgres if needed (set env vars like `DB_POSTGRESDB_HOST`, `DB_POSTGRESDB_DATABASE`, etc.).
2) **Credentials:** In the n8n UI, configure Postgres credentials plus any platform OAuth keys (Stripe webhook secret, Facebook/Google Ads/TikTok/Shopify/GA4) matching `.env`.
3) **Flows:** Import/export workflows via the n8n UI. Save exported JSON files under `n8n-flows/` (currently empty) so they stay versioned.
4) **TODO:** Add a docker-compose snippet for n8n + Postgres and document required env vars for shared credentials.
