# OmniTrackIQ Product Roadmap

This document tracks the development phases of OmniTrackIQ, including completed work and future plans.

---

## Overview

OmniTrackIQ is being built in iterative phases, each adding significant value to the platform. The goal is to create a comprehensive marketing analytics and attribution platform for e-commerce brands and agencies.

---

## Phase 1 — Deep Analytics ✅

**Goal**: Build comprehensive analytics dashboards with real metrics and drill-down capabilities.

### Backend

- [x] Metrics models (daily_metrics, ad_spend, orders)
- [x] Summary endpoint (`/metrics/summary`) with date filtering
- [x] Campaigns endpoint (`/metrics/campaigns`) with platform breakdown
- [x] Orders endpoint (`/metrics/orders`) with attribution data
- [x] Anomaly detection service and endpoints
- [x] Custom reports builder and scheduler

### Frontend

- [x] Overview dashboard with KPI cards and charts
- [x] Date range picker with presets (7d, 30d, 90d, custom)
- [x] Campaigns page with filtering and drill-down
- [x] Orders page with revenue attribution
- [x] Anomaly alerts display
- [x] Custom reports builder UI

### Future Enhancements

- [x] More attribution models (linear, time-decay, position-based, data-driven) — *Completed in Phase 5*
- [x] AI-powered forecasting and recommendations — *Completed in Phase 5*
- [x] Cohort analysis and LTV prediction — *Completed*
- [x] Funnel visualization and drop-off analysis — *Completed*

---

## Phase 2 — Billing (Stripe) ✅

**Goal**: Implement subscription billing with Stripe for monetization.

### Backend

- [x] Subscription model with Stripe fields
- [x] Checkout session creation endpoint
- [x] Customer portal endpoint
- [x] Webhook handler for subscription events
- [x] Plan enforcement middleware

### Frontend

- [x] Billing page with current plan display
- [x] Plan upgrade/downgrade flow
- [x] Stripe Checkout integration
- [x] Customer portal link
- [x] Usage and invoice history

### Pricing Tiers

| Plan | Price | Features |
|------|-------|----------|
| Starter | $49/mo | 2 integrations, basic analytics, email support |
| Pro | $149/mo | All integrations, advanced analytics, priority support |
| Agency | $399/mo | Unlimited clients, white-label, API access, dedicated support |

### Future Enhancements

- [ ] Usage-based pricing (per order, per event)
- [ ] Seat-based pricing for teams
- [ ] Annual billing discounts
- [ ] Enterprise custom pricing

---

## Phase 3 — Onboarding ✅

**Goal**: Create a guided onboarding flow to help users get value quickly.

### Backend

- [x] Onboarding status fields on Account model
- [x] Onboarding steps tracking (workspace, integrations, dashboard)
- [x] Onboarding status endpoint
- [x] Step completion endpoint

### Frontend

- [x] Dedicated `/onboarding` flow
- [x] Step 1: Workspace setup
- [x] Step 2: Connect first integration
- [x] Step 3: View dashboard tour
- [x] Progress indicator
- [x] Checklist banner on dashboard (until complete)
- [x] Skip option for experienced users

### Future Enhancements

- [ ] Interactive product tours (tooltips, highlights)
- [ ] Sample data for sandbox exploration
- [ ] Video tutorials embedded in flow
- [ ] Personalized recommendations based on industry

---

## Phase 4 — Marketing Site ✅

**Goal**: Build a professional, trustworthy B2B SaaS marketing website.

### Pages Created

- [x] Homepage (`/`) - Hero, features, testimonials, CTAs
- [x] Product (`/product`) - Feature deep-dive, how it works
- [x] Solutions (`/solutions`) - Use cases by segment (DTC, Agency, Growth)
- [x] Integrations (`/platforms`) - Platform cards with features
- [x] Pricing (`/pricing`) - Plan comparison, FAQs
- [x] Resources (`/resources`) - Hub for content
- [x] Blog (`/resources/blog`) - Article index with categories
- [x] Blog posts (`/resources/blog/[slug]`) - Individual articles
- [x] Case Studies (`/resources/case-studies`) - Customer success stories
- [x] Security (`/security`) - Security features and compliance
- [x] About (`/about`) - Company story and values
- [x] Contact (`/contact`) - Contact form and info

### Features

- [x] Responsive design (mobile, tablet, desktop)
- [x] SEO metadata on all pages
- [x] Header with navigation and CTAs
- [x] Footer with organized links
- [x] Light theme, professional design

### Future Enhancements

- [ ] Real blog content (SEO-optimized articles)
- [ ] Real case studies with customer approval
- [ ] Lead capture integrations (HubSpot, etc.)
- [ ] A/B testing for conversion optimization
- [ ] Analytics tracking (GA4, Mixpanel)

---

## Phase 5 — Advanced Analytics ✅

**Goal**: Add sophisticated analytics features for power users.

### Backend

- [x] AI Insights Service (`insights_service.py`)
  - [x] AI-powered insight generation with trend analysis
  - [x] Anomaly explanation with possible causes and recommendations
  - [x] Predictive alerts based on trend forecasting
- [x] Marketing Mix Modeling Service (`mmm_service.py`)
  - [x] Channel contribution analysis
  - [x] Budget optimization with 4 goals (maximize_revenue, maximize_roas, minimize_cpa, balanced)
  - [x] Scenario analysis for budget changes
  - [x] Diminishing returns analysis with quartile breakdown
- [x] Incrementality Testing Service (`incrementality_service.py`)
  - [x] Time-based incrementality analysis with statistical significance
  - [x] Baseline conversion estimation
  - [x] Holdout test design recommendations
  - [x] Conversion lift analysis per channel/campaign
- [x] API Routes (`routes_insights.py`)
  - [x] `/analytics/insights` - AI insights endpoint
  - [x] `/analytics/insights/anomaly-explanation` - Anomaly explanation
  - [x] `/analytics/insights/predictive-alerts` - Predictive alerts
  - [x] `/analytics/mmm/*` - MMM endpoints (4 endpoints)
  - [x] `/analytics/incrementality/*` - Incrementality endpoints (4 endpoints)

### Frontend

- [x] React Query hooks (`useInsights.ts`)
  - [x] Hooks for all insight, MMM, and incrementality endpoints
- [x] AI Insights Page (`/analytics/insights`)
  - [x] Summary cards, predictive alerts, insights list with filtering
- [x] Marketing Mix Modeling Page (`/analytics/mmm`)
  - [x] Channel contribution, budget optimization, diminishing returns tabs
- [x] Incrementality Testing Page (`/analytics/incrementality`)
  - [x] Time-based analysis, baseline estimation, conversion lift, test design tabs
- [x] Analytics Overview Page updated with Advanced Analytics section

### Future Enhancements

- [ ] Data-driven attribution with ML model
- [ ] Natural language queries for insights
- [ ] Custom model builder for attribution
- [ ] Real-time incrementality monitoring

---

## Phase 6 — Agency Features (Planned)

**Goal**: Build features specifically for agencies managing multiple clients.

### Planned Features

- [ ] Multi-account dashboard (client switcher)
- [ ] White-label reports with custom branding
- [ ] Client permission levels
- [ ] Cross-client benchmarking
- [ ] Automated client reporting
- [ ] Agency billing (pass-through to clients)

---

## Phase 7 — Enterprise (Planned)

**Goal**: Add enterprise-grade features for large organizations.

### Planned Features

- [ ] SSO (SAML, OIDC)
- [ ] Audit logs
- [ ] Data warehouse connectors (BigQuery, Snowflake, Redshift)
- [ ] Custom data retention policies
- [ ] Dedicated infrastructure options
- [ ] SLA guarantees
- [ ] SOC 2 Type II certification

---

## Future Ideas (Backlog)

These are ideas under consideration but not yet scheduled:

- **More integrations**: Pinterest Ads, Snapchat Ads, LinkedIn Ads, Amazon Ads, Klaviyo, WooCommerce
- **Mobile app**: iOS/Android companion app for alerts and quick metrics
- **Slack/Teams integration**: Daily summaries, alert notifications, slash commands
- **API for customers**: Public API for custom integrations and automation
- **Embeddable dashboards**: White-label embed for client portals
- **Data export**: Scheduled exports to CSV, Google Sheets, Data Studio

---

## Tech Stack Reference

| Component | Technology |
|-----------|------------|
| Frontend | Next.js 14, TypeScript, Tailwind CSS, React Query |
| Backend | FastAPI, SQLAlchemy, Alembic, Pydantic |
| Database | PostgreSQL 14+ |
| Billing | Stripe (Checkout, Subscriptions, Portal) |
| ETL | n8n workflows |
| Deployment | Render (frontend, backend, database) |
| Auth | JWT (HS256), bcrypt password hashing |

---

## Development Principles

1. **Security first**: Workspace isolation, input validation, secure defaults
2. **Performance**: Efficient queries, caching where needed, lazy loading
3. **User experience**: Fast, intuitive, accessible
4. **Maintainability**: Clean code, comprehensive docs, automated tests
5. **Incremental delivery**: Ship working features frequently

---

## Changelog

| Date | Phase | Description |
|------|-------|-------------|
| 2025-12 | Phase 5 | Advanced analytics complete (AI insights, MMM, incrementality) |
| 2024-12 | Phase 4 | Marketing site complete |
| 2024-12 | Phase 3 | Onboarding flow complete |
| 2024-12 | Phase 2 | Stripe billing complete |
| 2024-11 | Phase 1 | Analytics dashboards complete |
| 2024-10 | Foundation | Initial architecture, auth, basic dashboard |
