# OmniTrackIQ Deployment Guide

This document covers deployment procedures for OmniTrackIQ on Render.

---

## Architecture Overview

OmniTrackIQ is deployed as three services on Render:

| Service | Type | Purpose |
|---------|------|---------|
| Frontend | Web Service | Next.js 14 application |
| Backend | Web Service | FastAPI application |
| Database | PostgreSQL | Primary data store |

---

## Service Configuration

### Frontend Service

| Setting | Value |
|---------|-------|
| **Name** | omnitrackiq-frontend |
| **Root Directory** | `frontend` |
| **Runtime** | Node |
| **Node Version** | 20.x |
| **Build Command** | `npm install && npm run build` |
| **Start Command** | `npm run start` |

**Environment Variables:**

```bash
NEXT_PUBLIC_API_URL=https://omnitrackiq-backend.onrender.com
NEXT_PUBLIC_APP_URL=https://omnitrackiq.onrender.com
```

### Backend Service

| Setting | Value |
|---------|-------|
| **Name** | omnitrackiq-backend |
| **Root Directory** | `backend` |
| **Runtime** | Python 3 |
| **Build Command** | `pip install -r requirements.txt && alembic upgrade head` |
| **Start Command** | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

**Environment Variables:**

```bash
DATABASE_URL=<internal PostgreSQL URL>
JWT_SECRET_KEY=<32+ character secret>
FRONTEND_URL=https://omnitrackiq.onrender.com
STRIPE_SECRET_KEY=sk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
STRIPE_PRICE_ID_STARTER=price_xxx
STRIPE_PRICE_ID_PRO=price_xxx
STRIPE_PRICE_ID_AGENCY=price_xxx
# Plus any OAuth credentials for integrations
```

### PostgreSQL Database

| Setting | Value |
|---------|-------|
| **Name** | omnitrackiq-db |
| **Plan** | Starter or higher |
| **Region** | Same as services |

Use the **Internal Database URL** for the backend `DATABASE_URL`.

---

## Deployment Process

### Automatic Deployments

Render automatically deploys when you push to the `main` branch:

1. Push changes to `main`
2. Render detects the push
3. Build starts for affected services
4. Migrations run (backend build command)
5. New version goes live

### Manual Deployment

To trigger a manual deploy:

1. Go to Render Dashboard
2. Select the service
3. Click "Manual Deploy" → "Deploy latest commit"

### Rollback

To rollback to a previous version:

1. Go to Render Dashboard → Service → Events
2. Find the previous successful deploy
3. Click "Rollback to this deploy"

---

## Database Migrations

### Automatic (Recommended)

Migrations run automatically during backend build:

```bash
pip install -r requirements.txt && alembic upgrade head
```

### Manual Migration

If needed, run migrations manually:

1. Go to Render Dashboard → Backend Service
2. Click "Shell" tab
3. Run: `alembic upgrade head`

### Creating New Migrations

```bash
# Local development
cd backend
source venv/bin/activate
alembic revision --autogenerate -m "description"

# Commit and push
git add alembic/versions/
git commit -m "Add migration: description"
git push
```

---

## Secret Rotation

### JWT Secret Key

1. Generate new secret: `openssl rand -hex 32`
2. Update `JWT_SECRET_KEY` in Render environment
3. Click "Manual Deploy"
4. Note: All active sessions will be invalidated

### Stripe Secrets

**API Key Rotation:**

1. Generate new key in Stripe Dashboard
2. Update `STRIPE_SECRET_KEY` in Render
3. Deploy backend
4. Revoke old key in Stripe

**Webhook Secret Rotation:**

1. Go to Stripe Dashboard → Webhooks
2. Click on the webhook endpoint
3. Click "Reveal" to see secret, or rotate it
4. Update `STRIPE_WEBHOOK_SECRET` in Render
5. Deploy backend

### Database Password

1. Go to Render PostgreSQL dashboard
2. Reset password
3. Update `DATABASE_URL` in backend service
4. Deploy backend

---

## Monitoring

### Health Checks

Backend exposes health endpoints:

- `GET /health` - Basic liveness check
- `GET /health/ready` - Readiness (includes DB)

Configure Render health check:

- **Path**: `/health`
- **Interval**: 30 seconds

### Logs

View logs in Render Dashboard:

1. Select service
2. Click "Logs" tab
3. Filter by time range or search

### Alerts

Set up alerts in Render:

- Deploy failures
- Service crashes
- Health check failures

---

## Performance Tuning

### Frontend

- Next.js automatically optimizes images and code splitting
- Static pages are pre-rendered at build time
- Consider enabling Render's CDN for static assets

### Backend

- Render auto-scales based on plan
- For high traffic, consider upgrading to a larger instance
- Enable connection pooling for database

### Database

- Use the **Internal URL** (avoids network latency)
- Monitor query performance in Render dashboard
- Consider read replicas for heavy read loads

---

## Troubleshooting

### Build Failures

**Check build logs for:**

- Missing dependencies
- TypeScript/lint errors
- Environment variable issues

**Common fixes:**

```bash
# Clear npm cache
rm -rf node_modules package-lock.json
npm install

# Check Node version
node --version  # Should be 20.x
```

### Service Won't Start

**Check:**

- Start command is correct
- All required env vars are set
- Port binding (`$PORT` for backend, default for frontend)

### Database Connection Issues

**Check:**

- Using Internal URL (not External)
- SSL mode if required (`?sslmode=require`)
- Database is in same region as services

### Stripe Webhooks Failing

**Check:**

- Webhook URL: `https://your-backend.onrender.com/billing/webhook`
- Webhook secret matches env var
- All required events are selected

---

## Useful Commands

### Backend Shell (via Render)

```bash
# Check database connection
python -c "from app.db import engine; engine.connect(); print('OK')"

# Run migrations
alembic upgrade head

# Show current migration
alembic current

# Python REPL with app context
python -c "from app.main import app; print(app.title)"
```

### Frontend (Local Testing Production Build)

```bash
cd frontend
npm run build
npm run start
# Visit http://localhost:3000
```

---

## Environment Checklist

Before going live, verify:

### Backend

- [ ] `DATABASE_URL` points to production database
- [ ] `JWT_SECRET_KEY` is unique and secure (32+ chars)
- [ ] `FRONTEND_URL` is correct production URL
- [ ] `STRIPE_SECRET_KEY` is live key (not test)
- [ ] `STRIPE_WEBHOOK_SECRET` matches live webhook
- [ ] All Stripe price IDs are for live products
- [ ] CORS origins don't include localhost

### Frontend

- [ ] `NEXT_PUBLIC_API_URL` points to production backend
- [ ] `NEXT_PUBLIC_APP_URL` is correct production URL

### Stripe Dashboard

- [ ] Webhook endpoint URL is production backend
- [ ] Webhook is receiving events successfully
- [ ] Products and prices are in live mode

---

## Support

- **Render Status**: [status.render.com](https://status.render.com)
- **Render Docs**: [render.com/docs](https://render.com/docs)
- **OmniTrackIQ Support**: support@omnitrackiq.com
