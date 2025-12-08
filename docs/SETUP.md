# OmniTrackIQ Setup Guide

Complete guide to deploying and configuring OmniTrackIQ for production.

## Table of Contents

1. [Environment Variables](#environment-variables)
2. [Backend Setup](#backend-setup)
3. [Frontend Setup](#frontend-setup)
4. [Database Setup](#database-setup)
5. [Third-Party Integrations](#third-party-integrations)
6. [Deployment (Render)](#deployment-render)
7. [Security Checklist](#security-checklist)

---

## Environment Variables

### Backend (`/backend/.env`)

```bash
# ===================
# REQUIRED
# ===================

# Database
DATABASE_URL=postgresql://user:password@host:5432/omnitrackiq

# Security
JWT_SECRET_KEY=your-super-secret-key-min-32-chars
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend URL (for CORS and redirects)
FRONTEND_URL=https://your-frontend-domain.com

# ===================
# STRIPE (Required for billing)
# ===================
STRIPE_SECRET_KEY=sk_live_...
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PRICE_ID_STARTER=price_...
STRIPE_PRICE_ID_PRO=price_...
STRIPE_PRICE_ID_AGENCY=price_...

# ===================
# AD PLATFORM INTEGRATIONS (Optional - shows "coming soon" if not set)
# ===================

# Facebook/Meta
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Google Ads
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=

# TikTok
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=

# Shopify
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=

# ===================
# SOCIAL LOGIN (Optional - shows "coming soon" if not set)
# ===================

# Google OAuth (for social login)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Apple Sign-In
APPLE_CLIENT_ID=
APPLE_CLIENT_SECRET=

# ===================
# MONITORING (Recommended for production)
# ===================

# Sentry for error tracking
SENTRY_DSN=

# Log level
LOG_LEVEL=INFO

# ===================
# OPTIONAL
# ===================

# Rate limiting
RATE_LIMIT_REQUESTS_PER_MINUTE=60

# Email (for invites, alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@omnitrackiq.com
```

### Frontend (`/frontend/.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=https://your-backend-domain.com

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=

# App version (auto-set in CI/CD)
NEXT_PUBLIC_APP_VERSION=1.0.0
```

---

## Backend Setup

### Local Development

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
# Edit .env with your values

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Health Check Endpoints

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (includes DB)
- `GET /status` - Detailed status with version info

---

## Frontend Setup

### Local Development

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local
# Edit .env.local with your values

# Start development server
npm run dev
```

### Build for Production

```bash
npm run build
npm start
```

---

## Database Setup

### PostgreSQL

OmniTrackIQ requires PostgreSQL 14+.

```bash
# Create database
createdb omnitrackiq

# Run migrations
cd backend
alembic upgrade head
```

### Migrations

```bash
# Create new migration
alembic revision --autogenerate -m "description"

# Apply migrations
alembic upgrade head

# Rollback one migration
alembic downgrade -1
```

---

## Third-Party Integrations

### Stripe Setup

1. Create a Stripe account at https://stripe.com
2. Create Products and Prices for each plan:
   - Starter: $49/month
   - Pro: $149/month  
   - Agency: $399/month
3. Set up webhook endpoint: `https://your-backend/billing/webhook`
4. Add the environment variables

### Facebook Ads API

1. Create a Meta Developer account
2. Create an app with "Marketing API" permissions
3. Request `ads_read`, `ads_management`, `business_management` permissions
4. Add OAuth redirect: `https://your-frontend/integrations/facebook/callback`

### Google Ads API

1. Create a Google Cloud project
2. Enable the Google Ads API
3. Create OAuth 2.0 credentials
4. Request a Developer Token from Google Ads
5. Add OAuth redirect: `https://your-frontend/integrations/google_ads/callback`

### TikTok Ads API

1. Apply for TikTok Marketing API access
2. Create an app in TikTok for Business
3. Add OAuth redirect: `https://your-frontend/integrations/tiktok/callback`

### Shopify

1. Create a Shopify Partner account
2. Create a public or custom app
3. Request `read_orders`, `read_products`, `read_customers` scopes
4. Add OAuth redirect: `https://your-frontend/integrations/shopify/callback`

---

## Deployment (Render)

### Backend Service

1. Create a new Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Environment**: Add all backend env vars

### Frontend Service

1. Create a new Static Site or Web Service
2. Connect your GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start` (for Web Service)
   - **Publish Directory**: `out` (for Static Site with `next export`)
   - **Environment**: Add frontend env vars

### Database

1. Create a PostgreSQL database on Render
2. Copy the connection string to `DATABASE_URL`

---

## Security Checklist

### Before Production

- [ ] `JWT_SECRET_KEY` is at least 32 characters and randomly generated
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] All OAuth secrets are set (or features disabled)
- [ ] CORS origins are restricted to your domains only
- [ ] Rate limiting is enabled
- [ ] Sentry/error tracking is configured

### Cookie/Token Security

- [x] JWT tokens stored in localStorage (HttpOnly cookies optional)
- [x] Tokens expire after 24 hours
- [x] Refresh token rotation (if implemented)

### API Security

- [x] All `/dashboard/*` routes require authentication
- [x] All `/api/*` endpoints require valid JWT
- [x] Input validation on all endpoints
- [x] SQL injection protection via SQLAlchemy ORM

### Infrastructure

- [ ] HTTPS enforced on all endpoints
- [ ] Database backups configured
- [ ] Log retention policy set
- [ ] Monitoring alerts configured

---

## Troubleshooting

### "Not authenticated" error on signup

This usually means:
1. The backend `/auth/signup` endpoint is working but the frontend isn't receiving the token
2. Check browser console for CORS errors
3. Verify `NEXT_PUBLIC_API_URL` points to the correct backend

### Integration shows "coming soon"

This means the OAuth credentials for that platform aren't configured. Add the required `*_CLIENT_ID` and `*_CLIENT_SECRET` environment variables.

### Database connection errors

1. Verify `DATABASE_URL` is correct
2. Check if SSL is required (`?sslmode=require`)
3. Verify the database is accessible from your deployment platform

---

## Support

For issues or questions:
- Email: support@omnitrackiq.com
- Documentation: https://docs.omnitrackiq.com
