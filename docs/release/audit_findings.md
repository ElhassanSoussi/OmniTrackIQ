
# Release Candidate Reality Audit

| File | Area | Issue | Risk | Status/Fix |
|------|------|-------|------|------------|
| `routes_auth.py` | Social Auth | `TODO` Token Exchange | Low | **Deferred**: Feature not in V1 UI. |
| `stripe_service.py` | Billing | Placeholder IDs | Low | **Config**: Requires real IDs in Env Valid. |
| `sync_tasks.py` | Integrations | Placeholder Logic | Low | **Deferred**: Future integrations logic. |
| `main.py` | CORS | `localhost` in list | Low | **Safe**: Production URL must be valid. |
| `routes_scheduled_reports.py`| Email | `TODO` Implementation | Low | **Fixed**: Wired to email service. |

All identified "fake" logic is either:

1. **Removed** (e.g. Social Login Buttons).
2. **Gated/Hidden** (Contact Form removed).
3. **Deferred V1 Implementation** (Stripe/Integrations) - harmless without env vars.
