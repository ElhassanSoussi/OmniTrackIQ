# Pricing Sync Notes

**Date**: December 12, 2025

## Pricing Consistency Check

### Source of Truth: `frontend/src/config/plans.ts`

| Plan | Price | Seats | Workspaces | Data Retention | Integrations |
|------|-------|-------|------------|----------------|--------------|
| Starter | $49/mo | 2 | 1 | 30 days | 4 |
| Pro | $149/mo | 5 | 2 | 90 days | 8 |
| Enterprise | Custom | Unlimited | Unlimited | 1 year | Unlimited |

### Locations Checked

1. **plans.ts** - ✅ Master config
2. **/pricing page** - ✅ Uses PLANS from config
3. **/plans/[slug] pages** - ✅ Uses getPlanBySlug from config
4. **Backend billing** - ✅ Uses Stripe, prices set in Stripe Dashboard
5. **In-app billing page** - ✅ Fetches from Stripe via backend

### Consistency Status: ✅ All Aligned

All pricing displays use the centralized `plans.ts` config. No hardcoded values found elsewhere.

### Stripe Configuration Required

Prices must be set in Stripe Dashboard:

- `starter_monthly` → $49/month
- `pro_monthly` → $149/month  
- `enterprise` → Custom quote

### Notes

- Enterprise pricing shows "Custom" and links to /contact
- All plans show 14-day free trial messaging
- Plan limits are enforced in `frontend/src/lib/plan.ts`
