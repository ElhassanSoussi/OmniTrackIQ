# Frontend deployment

This app is a Next.js 14 project served as a Node application.

## Environment variables
`NEXT_PUBLIC_API_URL`

- Local development: http://localhost:8000 (fallback if not set)
- Production (Render): https://omnitrackiq-backend.onrender.com

Set this variable in Render and in `.env.local` for local overrides.
If it is missing in development, the app will warn in the console and fall back to `http://localhost:8000`.
All frontend API calls go through the shared `apiFetch` helper in `src/lib/api-client.ts`.

## Render configuration
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: Render uses Node 18 as specified in `.nvmrc` and `package.json`.
- Required Render env: `NEXT_PUBLIC_API_URL=https://omnitrackiq-backend.onrender.com`
