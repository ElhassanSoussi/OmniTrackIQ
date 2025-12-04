# OmniTrackIQ Roadmap & Requirements

This document captures the working instructions, roadmap, and guardrails for building OmniTrackIQ. Keep it updated as the product evolves.

## Stack
- Backend: FastAPI + SQLAlchemy + Alembic + PostgreSQL
- Frontend: Next.js App Router + TypeScript + Tailwind
- ETL: n8n workflows
- Billing: Stripe
- Auth: JWT (HS256)

## Repo Structure
- `backend/` — API, models, schemas, DB, auth, billing
- `frontend/` — Next.js app (marketing, auth, dashboard)
- `n8n-flows/` — workflow JSON files

## Security Requirements (must always hold)
1. Use bcrypt password hashing (passlib).
2. JWT-based auth using HS256, 24h expiry.
3. Never expose user or account IDs unless needed.
4. Restrict CORS to frontend domain(s).
5. Backend must validate ownership of `account_id` from JWT.
6. No secrets in repo — all read from environment variables.
7. Backend errors must be safe, with no internal leaks.
8. DB queries must always include `account_id = current_user.account_id`.

## Backend Requirements
Keep this structure:
```
backend/
  app/
    main.py
    config.py
    db.py
    api/
      routes_auth.py
      routes_billing.py
      routes_integrations.py
      routes_metrics.py
      routes_health.py
      deps.py
    models/
      user.py
      account.py
      integration.py
      ad_spend.py
      order.py
      subscription.py
    schemas/
      auth.py
      user.py
      metrics.py
      billing.py
      integrations.py
    security/
      password.py
      jwt.py
    services/
      auth_service.py
      billing_service.py
      metrics_service.py
      integrations_service.py
```

Features to implement:
- Auth: `/auth/signup`, `/auth/login`, `/auth/me`
- Billing: `/billing/checkout`, `/billing/webhook`, `/billing/me`
- Metrics: `/metrics/summary`, `/metrics/campaigns`, `/metrics/orders`
- Integrations: CRUD + connect URLs
- n8n uses direct DB access (separate user) or API endpoints

## Frontend Requirements
Structure:
```
frontend/
  src/
    app/
      (marketing)/page.tsx
      (auth)/login/page.tsx
      (auth)/signup/page.tsx
      (dashboard)/layout.tsx
      (dashboard)/page.tsx
      (dashboard)/campaigns/page.tsx
      (dashboard)/orders/page.tsx
      (dashboard)/integrations/page.tsx
      (dashboard)/billing/page.tsx
      (dashboard)/settings/page.tsx
    components/
      layout/
      marketing/
      dashboard/
    lib/
      api-client.ts
      auth.ts
    hooks/
      useAuth.ts
      useMetrics.ts
      useOrders.ts
      useIntegrations.ts
      useBilling.ts
```

Frontend tasks:
- Marketing homepage with hero, features, metrics strip
- Signup & login pages (talk to backend)
- Auth guard using `useAuth`
- Dashboard layout with sidebar/topbar
- Overview dashboard: KPI cards + chart
- Campaigns table
- Orders table
- Integrations cards
- Billing page with upgrade button
- Settings page

## ETL Requirements (n8n)
Start with:
1. Facebook Ads → `ad_spend` table (hourly)
2. Shopify Orders → `orders` table (hourly)

Later add: Google Ads, TikTok Ads, GA4, WooCommerce.

## High-Level Architecture
```
[Next.js Frontend] ── REST JSON ──► [FastAPI Backend] ── SQL ──► [Postgres]

[n8n Workflows] ─────────────────────────────────────────────────────────► [Postgres]

[Stripe Checkout] ──► Webhook ──► [FastAPI Billing] ──► DB
```

## Development Roadmap
**Phase 1 — MVP (secure, single-account)**
1. Build marketing homepage `/`
2. Build signup & login
3. Build secure backend auth
4. Build protected dashboard shell
5. Build KPI summary dashboard
6. Build campaigns & orders pages
7. Build integrations page
8. Add Stripe billing
9. Add n8n workflows (FB + Shopify)
10. Polish & deploy MVP

**Phase 2 — Agency Mode**
11. Multi-account support
12. Agency dashboard (client switcher)
13. White-label reports
14. Role-based access control

**Phase 3 — Advanced Analytics**
15. Attribution models
16. LTV/CAC
17. Alerts
18. Insights AI

**Phase 4 — Enterprise + AI**
19. SSO
20. BigQuery/Snowflake
21. MMM modeling
22. Dedicated infrastructure options

## Development Workflow Rules
1. Restate the task.
2. Propose numbered sub-steps.
3. Make changes in small batches.
4. After each task, output:
   - All files changed
   - Summary of changes
   - Confirmation that frontend (`npm run dev`) and backend (`uvicorn app.main:app --reload`) still run
5. Wait for approval before next steps.
