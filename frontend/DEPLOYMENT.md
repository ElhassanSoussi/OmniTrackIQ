# Frontend deployment

This app is a Next.js 14 project served as a Node application.

## Environment variables
- `NEXT_PUBLIC_API_URL`
  - Local development: `http://localhost:3001`
  - Production (Render): `https://omnitrackiq-backend.onrender.com`

Set this variable in Render and in `.env.local` for local overrides. If it
is missing, the app will warn in the console and fall back to
`http://localhost:3001` for development.

## Render configuration
- Root directory: `frontend`
- Build command: `npm install && npm run build`
- Start command: `npm run start`
- Node version: Render uses Node 18 as specified in `.nvmrc` and `package.json` engines.
- Required Render env: `NEXT_PUBLIC_API_URL=https://omnitrackiq-backend.onrender.com`
