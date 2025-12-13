
# Deployment Readiness Checklist

## 1. Backend Environment Variables

These variables must be set in the production environment (e.g., Render, Railway, AWS).

| Variable | Description | Required? | Example Value |
|----------|-------------|-----------|---------------|
| `DATABASE_URL` | PostgreSQL connection string | **Yes** | `postgresql://user:pass@host:5432/dbname` |
| `JWT_SECRET_KEY` | Secure key for token signing | **Yes** | `openssl rand -hex 32` |
| `FRONTEND_URL` | URL of the deployed frontend | **Yes** | `https://app.omnitrackiq.com` |
| `ENVIRONMENT` | Environment name | No (Default: prod) | `production` |
| `SMTP_HOST` | Email provider host | **Yes** (for emails) | `smtp.resend.com` |
| `SMTP_PORT` | Email provider port | **Yes** | `587` |
| `SMTP_USER` | Email provider user | **Yes** | `resend` |
| `SMTP_PASSWORD` | Email provider password | **Yes** | `re_123456789` |
| `EMAILS_FROM_EMAIL` | Sender address | **Yes** | `noreply@omnitrackiq.com` |

## 2. Frontend Environment Variables (Build Time)

These (except NEXT_PUBLIC) are used during `npm run build` or server-side rendering.

| Variable | Description | Required? | Example Value |
|----------|-------------|-----------|---------------|
| `NEXT_PUBLIC_API_URL` | Public URL of the backend API | **Yes** | `https://api.omnitrackiq.com` |
| `NEXT_PUBLIC_WS_URL` | Public WebSocket URL | No | `wss://api.omnitrackiq.com` |

> ⚠️ **Critical**: Ensure `NEXT_PUBLIC_API_URL` does NOT point to `localhost` in production builds.

## 3. Infrastructure

- **Database**: PostgreSQL 15+. Ensure `uuid-ossp` extension is enabled (handled by migrations).
- **Migration Strategy**: Run `alembic upgrade head` as a release command *before* starting the backend service.
- **CORS**: Verify backend `BACKEND_CORS_ORIGINS` includes the production frontend domain.

## 4. Secrets Management

## 5. Deploy Steps (Runbook)

### Render (Backend + Database)

1. **Create Web Service**: Connect your repo.
2. **Environment Variables**: Add all vars from Section 1.
3. **Build Command**: `./build.sh` (or `pip install -r requirements.txt`)
4. **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
5. **Migrations**: Add a "Pre-Deploy Command" or run manually in shell: `alembic upgrade head`.
6. **Health Check Path**: `/health`

### Vercel (Frontend)

1. **Import Project**: Connect your repo settings.
2. **Environment Variables**: Add `NEXT_PUBLIC_API_URL` (point to Render backend URL).
3. **Build Command**: `npm run build` (Next.js default).

### Common Failure Scenarios

- **CORS Error**: Backend `BACKEND_CORS_ORIGINS` must match Frontend URL exactly (keep trailing slash consistency).
- **500 on Login**: Check `DATABASE_URL` is correct and migrations (`alembic upgrade head`) ran.
- **Frontend 404s**: Check `NEXT_PUBLIC_API_URL` is set during *build time* (not just runtime).
- **Email Failures**: Verify `SMTP_` vars. If invalid, the system logs the error but continues (soft fail).

4. **Output Directory**: `.next` (Next.js default).
5. **Verify**: Visit deployed URL, try Signup -> Dashboard. Check console for any CORS errors.
