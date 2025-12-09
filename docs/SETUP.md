# OmniTrackIQ Setup Guide

Complete guide for local development and production deployment of OmniTrackIQ.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Variables](#environment-variables)
3. [Local Development](#local-development)
4. [Database Setup](#database-setup)
5. [Third-Party Integrations](#third-party-integrations)
6. [Render Deployment](#render-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

| Requirement | Version | Notes |
|-------------|---------|-------|
| Node.js | 20.x | Use nvm: `nvm use` in frontend/ |
| Python | 3.11+ | Backend runtime |
| PostgreSQL | 14+ | Primary database |
| npm | 9+ | Package manager |

---

## Environment Variables

### Backend (`backend/.env`)

```bash
# ============================================
# REQUIRED - Core Configuration
# ============================================

# Database (PostgreSQL connection string)
DATABASE_URL=postgresql://user:password@localhost:5432/omnitrackiq

# Security
JWT_SECRET_KEY=your-super-secret-key-minimum-32-characters
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Frontend URL (for CORS and OAuth redirects)
FRONTEND_URL=http://localhost:3000

# CORS Origins (comma-separated for multiple)
BACKEND_CORS_ORIGINS=http://localhost:3000

# ============================================
# REQUIRED - Stripe Billing
# ============================================

STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (create these in Stripe Dashboard)
STRIPE_PRICE_ID_STARTER=price_starter_xxx
STRIPE_PRICE_ID_PRO=price_pro_xxx
STRIPE_PRICE_ID_AGENCY=price_agency_xxx

# ============================================
# OPTIONAL - Ad Platform Integrations
# ============================================

# Facebook/Meta Ads
FACEBOOK_CLIENT_ID=
FACEBOOK_CLIENT_SECRET=

# Google Ads
GOOGLE_ADS_CLIENT_ID=
GOOGLE_ADS_CLIENT_SECRET=
GOOGLE_ADS_DEVELOPER_TOKEN=

# TikTok Ads
TIKTOK_CLIENT_ID=
TIKTOK_CLIENT_SECRET=

# Shopify
SHOPIFY_CLIENT_ID=
SHOPIFY_CLIENT_SECRET=

# ============================================
# OPTIONAL - Social Login
# ============================================

# Google OAuth (for social login, separate from Google Ads)
GOOGLE_OAUTH_CLIENT_ID=
GOOGLE_OAUTH_CLIENT_SECRET=

# GitHub OAuth
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# ============================================
# OPTIONAL - Monitoring & Email
# ============================================

# Sentry error tracking
SENTRY_DSN=

# Log level (DEBUG, INFO, WARNING, ERROR)
LOG_LEVEL=INFO

# Email (for team invites, alerts)
SMTP_HOST=
SMTP_PORT=587
SMTP_USER=
SMTP_PASSWORD=
FROM_EMAIL=noreply@omnitrackiq.com
```

### Frontend (`frontend/.env.local`)

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# App URL (for metadata)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Sentry (optional)
NEXT_PUBLIC_SENTRY_DSN=
```

---

## Local Development

### Backend

```bash
cd backend

# 1. Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Set up environment
cp .env.example .env
# Edit .env with your values (see Environment Variables above)

# 4. Run database migrations
alembic upgrade head

# 5. Start development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`.

**Health Check Endpoints:**

- `GET /health` - Basic health check
- `GET /health/ready` - Readiness check (includes database)
- `GET /docs` - Swagger API documentation

### Frontend

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Set up environment
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# 3. Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

**Available Commands:**

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Running Both Together

For local development, run both in separate terminals:

```bash
# Terminal 1: Backend
cd backend && source venv/bin/activate && uvicorn app.main:app --reload --port 8000

# Terminal 2: Frontend
cd frontend && npm run dev
```

---

## Database Setup

### PostgreSQL Installation

**macOS (Homebrew):**

```bash
brew install postgresql@14
brew services start postgresql@14
createdb omnitrackiq
```

**Ubuntu/Debian:**

```bash
sudo apt install postgresql-14
sudo -u postgres createdb omnitrackiq
```

**Docker:**

```bash
docker run -d \
  --name omnitrackiq-db \
  -e POSTGRES_DB=omnitrackiq \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -p 5432:5432 \
  postgres:14
```

### Migrations

```bash
cd backend
source venv/bin/activate

# Apply all migrations
alembic upgrade head

# Create new migration (after model changes)
alembic revision --autogenerate -m "description of changes"

# Rollback one migration
alembic downgrade -1

# Show current revision
alembic current

# Show migration history
alembic history
```

---

## Third-Party Integrations

### Stripe Setup

1. **Create Stripe Account**: Sign up at [stripe.com](https://stripe.com)

2. **Create Products & Prices**:
   - Starter: $49/month
   - Pro: $149/month
   - Agency: $399/month

3. **Set Up Webhook**:
   - Endpoint URL: `https://your-backend.com/billing/webhook`
   - Events to listen for:
     - `checkout.session.completed`
     - `customer.subscription.updated`
     - `customer.subscription.deleted`
     - `invoice.payment_succeeded`
     - `invoice.payment_failed`

4. **Add Environment Variables** (see above)

### Facebook Ads API

1. Create Meta Developer account at [developers.facebook.com](https://developers.facebook.com)
2. Create an app with "Marketing API" product
3. Request permissions: `ads_read`, `ads_management`, `business_management`
4. Add OAuth redirect: `https://your-frontend.com/integrations/facebook/callback`

### Google Ads API

1. Create Google Cloud project at [console.cloud.google.com](https://console.cloud.google.com)
2. Enable Google Ads API
3. Create OAuth 2.0 credentials
4. Apply for Developer Token in Google Ads account
5. Add OAuth redirect: `https://your-frontend.com/integrations/google_ads/callback`

### TikTok Ads API

1. Apply for TikTok Marketing API access
2. Create app in TikTok for Business Developer Portal
3. Add OAuth redirect: `https://your-frontend.com/integrations/tiktok/callback`

### Shopify

1. Create Shopify Partner account at [partners.shopify.com](https://partners.shopify.com)
2. Create a public or custom app
3. Request scopes: `read_orders`, `read_products`, `read_customers`
4. Add OAuth redirect: `https://your-frontend.com/integrations/shopify/callback`

---

## Render Deployment

### Backend Service

1. **Create Web Service** on Render
2. **Connect GitHub** repository
3. **Configure:**

| Setting | Value |
|---------|-------|
| Root Directory | `backend` |
| Runtime | Python 3 |
| Build Command | `pip install -r requirements.txt && alembic upgrade head` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |

4. **Environment Variables** (add all from backend/.env):
   - `DATABASE_URL` (use Render PostgreSQL internal URL)
   - `JWT_SECRET_KEY`
   - `FRONTEND_URL`
   - `STRIPE_SECRET_KEY`
   - `STRIPE_WEBHOOK_SECRET`
   - All Stripe price IDs
   - Any integration OAuth credentials

### Frontend Service

1. **Create Web Service** on Render
2. **Connect GitHub** repository
3. **Configure:**

| Setting | Value |
|---------|-------|
| Root Directory | `frontend` |
| Runtime | Node |
| Node Version | 20.x |
| Build Command | `npm install && npm run build` |
| Start Command | `npm run start` |

4. **Environment Variables:**
   - `NEXT_PUBLIC_API_URL=https://your-backend.onrender.com`
   - `NEXT_PUBLIC_APP_URL=https://your-frontend.onrender.com`

### PostgreSQL Database

1. **Create PostgreSQL** on Render
2. **Copy Internal Database URL**
3. **Add to Backend** as `DATABASE_URL`

### Important Notes

- Use **Internal Database URL** for backend (faster, no egress costs)
- Migrations run automatically on deploy via build command
- Set Node version to 20.x in Render dashboard or via `engines` in package.json

---

## Troubleshooting

### "Not authenticated" Error

**Cause**: JWT token not being sent or invalid

**Solutions**:
1. Check browser console for CORS errors
2. Verify `NEXT_PUBLIC_API_URL` is correct
3. Ensure `BACKEND_CORS_ORIGINS` includes frontend URL
4. Check that JWT_SECRET_KEY matches between requests

### Integration Shows "Coming Soon"

**Cause**: OAuth credentials not configured

**Solution**: Add the required `*_CLIENT_ID` and `*_CLIENT_SECRET` environment variables for that platform.

### Database Connection Errors

**Solutions**:
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:5432/dbname`
2. Add `?sslmode=require` for remote databases
3. Check database is running and accessible
4. Verify network/firewall allows connection

### Stripe Webhook Failures

**Solutions**:
1. Verify `STRIPE_WEBHOOK_SECRET` matches the webhook endpoint
2. Check webhook endpoint URL is accessible
3. Ensure all required events are selected in Stripe Dashboard
4. Test with Stripe CLI: `stripe listen --forward-to localhost:8000/billing/webhook`

### Build Fails on Render

**Solutions**:
1. Check build logs for specific error
2. Verify Node version is 20.x (not 18)
3. Ensure all required environment variables are set
4. Check for missing dependencies in package.json/requirements.txt

---

## Support

- **Email**: support@omnitrackiq.com
- **GitHub Issues**: For bug reports and feature requests
- **Documentation**: [docs.omnitrackiq.com](https://docs.omnitrackiq.com)
