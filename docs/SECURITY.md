# OmniTrackIQ Security

This document outlines the security measures and practices implemented in OmniTrackIQ.

---

## Data Isolation

### Workspace (Multi-Tenant) Isolation

All data in OmniTrackIQ is scoped by workspace (account):

- **Analytics data**: Metrics, campaigns, orders are tied to a specific workspace
- **Billing data**: Subscriptions and payment history are workspace-scoped
- **User data**: Users belong to one or more workspaces with explicit roles
- **Integration credentials**: OAuth tokens stored per workspace

**Implementation**: Every database query includes an `account_id` filter derived from the authenticated user's JWT token. There is no way to query data across workspaces.

```python
# Example: All queries are scoped
def get_metrics(db: Session, account_id: str):
    return db.query(DailyMetrics).filter(
        DailyMetrics.account_id == account_id
    ).all()
```

---

## Authentication

### JWT-Based Authentication

- **Algorithm**: HS256 (HMAC with SHA-256)
- **Token Expiry**: 24 hours
- **Storage**: Tokens stored in localStorage on the frontend
- **Refresh**: Users must re-authenticate after token expiry

### Password Security

- **Hashing**: bcrypt via passlib
- **Minimum Requirements**: 8 characters (configurable)
- **No Plain Text**: Passwords are never stored or logged in plain text

### Social Login (Optional)

When configured, OmniTrackIQ supports OAuth 2.0 social login:

- Google
- GitHub

Social login tokens are only used for authentication; no additional data is accessed.

---

## Data in Transit

### TLS/HTTPS

- **Requirement**: All production traffic must use HTTPS
- **Enforcement**: Render automatically provisions TLS certificates
- **HSTS**: Recommended to enable via headers (TODO)

### API Security

- **CORS**: Restricted to configured frontend domains
- **Rate Limiting**: Configurable requests per minute (default: 60)
- **Input Validation**: All inputs validated via Pydantic schemas

---

## Secrets Management

### Environment Variables

All secrets are stored as environment variables, never committed to the repository:

| Secret | Purpose |
|--------|---------|
| `JWT_SECRET_KEY` | JWT signing (min 32 chars) |
| `DATABASE_URL` | Database connection |
| `STRIPE_SECRET_KEY` | Stripe API access |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook verification |
| `*_CLIENT_SECRET` | OAuth provider secrets |

### Secret Rotation

To rotate secrets:

1. Generate new secret value
2. Update in Render environment variables
3. Redeploy backend service
4. Verify functionality
5. (For Stripe) Update webhook endpoint if needed

---

## Access Control

### Role-Based Permissions

OmniTrackIQ implements role-based access control (RBAC) for workspaces:

| Role | Permissions |
|------|-------------|
| **Owner** | Full access, billing, delete workspace |
| **Admin** | Manage users, integrations, settings |
| **Member** | View dashboards, basic actions |

### API Authorization

Every protected endpoint:

1. Validates JWT token
2. Extracts user and account information
3. Verifies user has access to the requested resource
4. Filters data by account_id

```python
@router.get("/metrics")
async def get_metrics(current_user: User = Depends(get_current_user)):
    # current_user.account_id is automatically used
    # to scope all data access
    ...
```

---

## Infrastructure Security

### Render Platform

OmniTrackIQ is deployed on Render, which provides:

- **Isolation**: Services run in isolated containers
- **Network**: Private networking between services
- **DDoS Protection**: Automatic at the platform level
- **Backups**: PostgreSQL automatic daily backups

### Database Security

- **Connection**: SSL required for production (`?sslmode=require`)
- **Access**: Internal URL used (not exposed to internet)
- **Credentials**: Managed via environment variables

---

## Security Best Practices

### What We Do

- ✅ Bcrypt password hashing
- ✅ JWT with expiration
- ✅ Workspace data isolation
- ✅ Input validation on all endpoints
- ✅ SQL injection protection via ORM
- ✅ CORS origin restrictions
- ✅ No secrets in repository
- ✅ HTTPS in production

### Security Checklist for Deployments

- [ ] `JWT_SECRET_KEY` is randomly generated and at least 32 characters
- [ ] `DATABASE_URL` uses SSL (`?sslmode=require`)
- [ ] `BACKEND_CORS_ORIGINS` only includes your domains
- [ ] Stripe webhook secret is correct for your endpoint
- [ ] All OAuth secrets are set (or features disabled)
- [ ] Error responses don't leak internal details

---

## Vulnerability Reporting

If you discover a security vulnerability, please report it responsibly:

1. **Email**: security@omnitrackiq.com
2. **Do not** open public GitHub issues for security vulnerabilities
3. We will respond within 48 hours
4. We appreciate responsible disclosure

---

## Compliance Roadmap

OmniTrackIQ is committed to meeting compliance standards as the product matures:

### Current Status

| Standard | Status |
|----------|--------|
| HTTPS/TLS | ✅ Implemented |
| Data Isolation | ✅ Implemented |
| Password Hashing | ✅ Implemented |
| Input Validation | ✅ Implemented |

### Future (Planned)

| Standard | Status | Timeline |
|----------|--------|----------|
| SOC 2 Type I | 🔜 Planned | 2025 |
| SOC 2 Type II | 🔜 Planned | 2025-2026 |
| GDPR Compliance | 🔜 Planned | 2025 |
| CCPA Compliance | 🔜 Planned | 2025 |
| ISO 27001 | 📋 Roadmap | TBD |

**Note**: OmniTrackIQ does not currently hold SOC 2, ISO 27001, or other formal certifications. We are working toward these as the business scales.

---

## Data Retention

### Default Retention

- **Analytics data**: Per plan (7 days - unlimited)
- **Audit logs**: 90 days
- **Deleted accounts**: 30 days grace period, then purged

### Data Deletion

Users can request data deletion:

1. Contact support@omnitrackiq.com
2. We process deletion requests within 30 days
3. All workspace data is permanently removed

---

## Third-Party Services

OmniTrackIQ integrates with third-party services. Here's how we handle their data:

| Service | Data Accessed | Storage |
|---------|---------------|---------|
| Stripe | Payment info | Stored by Stripe, we store subscription IDs |
| Facebook Ads | Campaign metrics | Stored in our database, scoped by workspace |
| Google Ads | Campaign metrics | Stored in our database, scoped by workspace |
| TikTok Ads | Campaign metrics | Stored in our database, scoped by workspace |
| Shopify | Orders, products | Stored in our database, scoped by workspace |
| GA4 | Analytics events | Stored in our database, scoped by workspace |

**OAuth tokens** for integrations are encrypted at rest and can be revoked at any time by the user.

---

## Questions?

For security-related questions, contact: security@omnitrackiq.com
