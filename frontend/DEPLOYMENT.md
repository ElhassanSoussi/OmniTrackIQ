# Frontend deployment

This app is a Next.js 14 project served as a Node application.

## Environment variables
- `NEXT_PUBLIC_API_URL`
  - Local development: `http://localhost:8000`
  - Production (Render): `https://omnitackiq-backend.onrender.com`

Set this variable in Render and in `.env.local` for local overrides.

## Render configuration
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: Render uses Node 18 as specified in `.nvmrc` and `package.json` engines.
- Required Render env: `NEXT_PUBLIC_API_URL=https://omnitackiq-backend.onrender.com`
