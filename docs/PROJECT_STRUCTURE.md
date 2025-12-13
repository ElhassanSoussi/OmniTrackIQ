# Project Structure & Documentation Index

This document lists all key files, folders, and documentation in the OmniTrackIQ project.

## 📂 Documentation

### Core Docs

- [Start Here (Index)](./INDEX.md)
- [Setup Guide](./SETUP.md)
- [Roadmap](./ROADMAP.md)
- [Security Policy](./SECURITY.md)
- [Architecture Overview](./architecture/overview.md)

### Internal Engineering Logs (`docs/internal/`)

**Phase 0: Audit**

- [Full Report](./internal/phase-0-audit/full-report.md)
- [Summary](./internal/phase-0-audit/summary.md)

**Phase 1: Foundation**

- [Initial State](./internal/phase-1-start/initial-state.md)
- [Report](./internal/phase-1-start/report.md)

**Phase 2: Marketing**

- [Sync Summary](./internal/phase-2-marketing/sync-summary.md)
- [Routes](./internal/phase-2-marketing/routes.md)

**Phase 3A: Product Profitability**

- [Implementation Notes](./internal/phase-3a-profitability/implementation-notes.md)
- [Reality Check](./internal/phase-3a-profitability/reality-check.md)

**Phase 3B: Settings**

- [Inventory](./internal/phase-3b-settings/inventory.md)
- [Summary](./internal/phase-3b-settings/summary.md)

**Other**

- [Pricing Notes](./internal/pricing/sync-notes.md)
- [Auth Notes](./internal/auth/notes.md)

---

## 📂 Backend (`/backend`)

**Tech**: FastAPI, SQLAlchemy, Pydantic, Alembic

### Core Application (`app/`)

- **Main**: `main.py`
- **Config**: `config.py`, `db.py`
- **Models** (`models/`):
  - `user.py`, `account.py`, `ad_account.py`, `ad_spend.py`
  - `order.py`, `order_item.py`
  - `integration.py`, `subscription.py`, `enterprise.py`
- **API Routes** (`routers/`):
  - `routes_auth.py`, `routes_billing.py`, `routes_metrics.py`
  - `routes_products.py`, `routes_team.py`
  - `routes_integrations.py`, `routes_enterprise.py`

---

## 📂 Frontend (`/frontend`)

**Tech**: Next.js 14, Tailwind CSS, TypeScript, Shadcn UI

### App Routes (`src/app/`)

- **(auth)**: `/login`, `/signup`, `/reset-password`
- **(marketing)**: `/`, `/pricing`, `/features`, `/blog`
- **(dashboard)**:
  - `/dashboard`, `/analytics/products`
  - `/settings`, `/integrations`

### Config (`src/config/`)

- `plans.ts` (Pricing source of truth)
