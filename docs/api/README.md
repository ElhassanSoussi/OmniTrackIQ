# API Documentation

The OmniTrackIQ API adheres to OpenAPI 3.0 specification.

## Implementation Status

### Fully Implemented

- **Authentication**: Usage, Login, Profile updates.
- **Settings**: Profile and Organization management.
- **Metrics**: Summary, Campaign, and Order analytics.
- **Billing**: Subscription management via Stripe.
- **Integrations**: Platform connection status.
- **Onboarding**: State tracking.
- **Agency**: Client management (multi-tenant).
- **Enterprise**: Audit logs, SSO, API keys.

### Planned (Not Yet Implemented/Mocked)

- **Real-time WebSockets**: Basic connection exists, full event streaming pending.
- **Chat**: Placeholder routes.
- **Advanced Predictive Models**: Some AI endpoints are mocked simulations until ML infrastructure is deployed.

## Trust & Transparancy

If you encounter a `501 Not Implemented` or simulated data, it is by design for the current phase. We aim to mark all such endpoints clearly in the Swagger UI description.

## Router & Tag Structure

To avoid duplications in the OpenAPI schema:

1. **Tags** are defined at the **Router** level (inside `routes_*.py`) via `@router.get(..., tags=["Tag Name"])`.
2. **Prefixes** are defined in `main.py` during inclusion (`app.include_router(..., prefix="/...")`).
3. **Shared Prefixes**: Multiple routers may share a prefix (e.g., `/analytics`) as long as their sub-paths differ.
    - `routes_insights.py` -> `/analytics/insights`, `/analytics/mmm`
    - `routes_analytics_mgmt.py` -> `/analytics/templates`, `/analytics/custom-metrics`
