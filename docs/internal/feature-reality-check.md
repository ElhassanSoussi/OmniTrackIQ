# Feature Reality Check

**Date**: December 12, 2025

This document compares features promised on marketing pages vs actual implementation.

---

## Legend

- ✅ **Implemented** - Works end-to-end with real/demo data
- ⚠️ **Partial** - UI exists but backend stubbed or limited
- ❌ **Not Yet** - Only marketing copy, no real feature

---

## Core Dashboard Features

| Feature | Plan(s) | Status | Notes |
|---------|---------|--------|-------|
| Shopify integration | All | ✅ Implemented | OAuth flow + order sync |
| Facebook Ads integration | All | ⚠️ Partial | OAuth works, data sync via n8n stub |
| Google Ads integration | All | ⚠️ Partial | OAuth works, data sync via n8n stub |
| TikTok Ads integration | Pro+ | ⚠️ Partial | OAuth works, data sync via n8n stub |
| "Money In vs Money Out" dashboard | All | ✅ Implemented | KPI cards show revenue vs spend |
| Real profit tracking | All | ⚠️ Partial | Shows profit = revenue - spend (no COGS) |
| Simple ROAS by channel | All | ✅ Implemented | Channel breakdown with ROAS |
| Founder Mode | All | ✅ Implemented | `/dashboard` toggle |
| Basic alerts | All | ⚠️ Partial | Alert UI exists, no backend triggers |
| Weekly email report | All | ❌ Not Yet | Scheduled reports exist but no email sender |

## Pro Features

| Feature | Plan(s) | Status | Notes |
|---------|---------|--------|-------|
| GA4 integration | Pro+ | ⚠️ Partial | OAuth flow only, no data sync |
| Cohort analysis | Pro+ | ✅ Implemented | `/analytics/cohorts` with heatmap |
| Funnel view | Pro+ | ✅ Implemented | `/analytics/funnel` 3 views |
| Per-product profitability | Pro+ | ❌ Not Yet | Only in marketing copy |
| Creative Intelligence v1 | Pro+ | ✅ Implemented | `/analytics/creatives` with fatigue detection |
| Top creatives by ROAS | Pro+ | ⚠️ Partial | Uses mock data array |
| Creative fatigue detection | Pro+ | ✅ Implemented | CTR/CTR drop indicators |
| AI "Ask Your Data" chatbot | Pro+ | ✅ Implemented | `/dashboard` chatbot component |
| Daily email reports | Pro+ | ❌ Not Yet | Scheduling UI only, no email sender |
| Multi-touch attribution | Pro+ | ⚠️ Partial | UI complete, needs touchpoint data |

## Enterprise Features

| Feature | Plan(s) | Status | Notes |
|---------|---------|--------|-------|
| Unlimited client workspaces | Enterprise | ✅ Implemented | `/agency` multi-client switcher |
| Client switching | Enterprise | ✅ Implemented | Agency dashboard works |
| Client-specific permissions | Enterprise | ✅ Implemented | RBAC with roles |
| White-label options | Enterprise | ❌ Not Yet | Only in marketing copy |
| Automatic client reports | Enterprise | ⚠️ Partial | Report builder exists, no auto-send |
| A/B Creative Inspector | Enterprise | ❌ Not Yet | Only in marketing copy |
| AI Strategist Mode | Enterprise | ❌ Not Yet | Only in marketing copy |
| Budget recommendations | Enterprise | ❌ Not Yet | Only in marketing copy |
| Pause suggestions | Enterprise | ❌ Not Yet | Only in marketing copy |
| Industry benchmarks | Enterprise | ❌ Not Yet | Only in marketing copy |
| CSV export for accountants | Enterprise | ⚠️ Partial | Report export exists, basic CSV |
| SSO (SAML/OIDC) | Enterprise | ⚠️ Partial | Settings UI stub only |
| Audit logs | Enterprise | ✅ Implemented | `/settings/enterprise/audit-logs` |
| API access | Enterprise | ⚠️ Partial | Settings UI, no public API docs |

## Security & Infrastructure

| Feature | Plan(s) | Status | Notes |
|---------|---------|--------|-------|
| TLS encryption | All | ✅ Implemented | Vercel/Render HTTPS |
| AES-256 at rest | All | ✅ Implemented | PostgreSQL native |
| RBAC | All | ✅ Implemented | Owner/Admin/Member/Viewer |
| GDPR compliance | All | ✅ Implemented | Security page documented |
| SOC 2 | All | ❌ Not Yet | "On Roadmap" in security page |
| ISO 27001 | Enterprise | ❌ Not Yet | "On Roadmap" in security page |

---

## Summary

| Category | Implemented | Partial | Not Yet |
|----------|-------------|---------|---------|
| Core Dashboard | 5 | 4 | 1 |
| Pro Features | 5 | 3 | 2 |
| Enterprise | 4 | 4 | 6 |
| Security | 4 | 0 | 2 |
| **Total** | **18** | **11** | **11** |

---

## Priority Fixes Needed

### Must Fix (Misleading Claims)

1. **Weekly/Daily email reports** - UI exists but no email sender wired
2. **SOC 2 Compliant badge** on homepage - Security page says "On Roadmap"

### Should Add "Coming Soon" Labels

1. AI Strategist Mode
2. Budget recommendations
3. A/B Creative Inspector
4. Industry benchmarks
5. White-label reports
6. Per-product profitability

### Data Pipeline Gap

Many features show ⚠️ Partial because ad platform data sync isn't fully wired. The n8n workflows exist as stubs but need real API polling.

---

## Phase 2 Marketing Sync Changes

**Date**: December 12, 2025

### Files Updated

| File | Change |
|------|--------|
| `frontend/src/config/plans.ts` | Added `comingSoon` property; marked 9 features as Coming Soon |
| `frontend/src/app/(marketing)/pricing/page.tsx` | Added Coming Soon badge display |
| `frontend/src/app/(marketing)/solutions/page.tsx` | Replaced false claims with real features |
| `frontend/src/app/(marketing)/page.tsx` | SOC 2 badge changed from "Compliant" to "In Progress" |

### Features Marked "Coming Soon"

| Feature | Plan |
|---------|------|
| Weekly email report | Starter |
| Daily email reports | Pro |
| Per-product profitability | Pro |
| White-label options | Enterprise |
| A/B Creative Inspector | Enterprise |
| AI Strategist Mode | Enterprise |
| Budget recommendations | Enterprise |
| Pause suggestions | Enterprise |
| Industry benchmarks | Enterprise |

### Claims Removed/Changed

| Old Claim | New Claim | Location |
|-----------|-----------|----------|
| "White-label reports, automated alerts" | "Multi-account access, role-based permissions" | Solutions page |
| "Cross-client benchmarking" | "Unified performance dashboards" | Solutions page |
| "SOC 2 Compliant" | "SOC 2 In Progress" | Homepage |
| "AI strategy recommendations" | "role-based access, dedicated support" | Enterprise description |
