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
