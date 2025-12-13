# OmniTrackIQ Authentication Notes

## Current Auth System

OmniTrackIQ uses a **custom JWT-based authentication** system:

- **Backend**: FastAPI with JWT tokens (HS256, 24h expiry)
- **Frontend**: React hooks (`useAuth`) + localStorage for token storage
- **No OAuth providers** currently implemented (Google, GitHub, Apple support planned)

## Auth Flow

### Signup
1. Frontend collects: `email`, `password`, `account_name`
2. POST `/auth/signup` → Backend validates, creates Account + User, returns JWT
3. Frontend stores token in localStorage, redirects to `/dashboard`

### Login
1. Frontend collects: `email`, `password`
2. POST `/auth/login` → Backend validates credentials, returns JWT
3. Frontend stores token in localStorage, redirects to `/dashboard`

### Session Check
1. On dashboard load, `useAuth` calls GET `/auth/me` with Bearer token
2. If 401/403, user is redirected to `/login`
3. If successful, user data is available in context

### Logout
1. Frontend clears localStorage token
2. Redirects to `/login` (or landing page)

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | `/auth/signup` | Create new user + account |
| POST | `/auth/login` | Authenticate existing user |
| GET | `/auth/me` | Get current user info (requires Bearer token) |

## Request/Response Formats

### Signup Request
```json
{
  "email": "user@example.com",
  "password": "minimum8chars",
  "account_name": "My Company"
}
```

### Login Request
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Token Response
```json
{
  "access_token": "eyJ...",
  "token_type": "bearer"
}
```

### User Info Response (GET /auth/me)
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "account_id": "uuid"
}
```

## Validation Rules

### Email
- Must be valid email format
- Normalized to lowercase
- Must be unique (signup only)

### Password
- Minimum 8 characters

### Account Name
- Required for signup
- Cannot be empty/whitespace

## Common Error Responses

| Status | Detail | Cause |
|--------|--------|-------|
| 400 | "Email already registered" | Signup with existing email |
| 401 | "Invalid credentials" | Wrong email/password on login |
| 422 | Validation errors array | Invalid input format |

## Environment Variables

### Backend
- `JWT_SECRET_KEY` - Secret for signing tokens
- `JWT_ALGORITHM` - Algorithm (default: HS256)
- `JWT_ACCESS_TOKEN_EXPIRE_MINUTES` - Token lifetime (default: 1440 = 24h)

### Frontend
- `NEXT_PUBLIC_API_URL` - Backend API base URL

## Route Structure

### Public Routes
- `/` - Landing/marketing page
- `/login` - Login form
- `/signup` - Signup form
- `/pricing` - Pricing page

### Protected Routes (require auth)
- `/dashboard` - Overview
- `/dashboard/campaigns` - Campaigns table
- `/dashboard/orders` - Orders table
- `/dashboard/integrations` - Integration connections
- `/dashboard/billing` - Subscription management
- `/dashboard/settings` - Account settings

## Known Issues & Fixes

### "Invalid data provided" Error
- **Cause**: Pydantic returns validation errors as an array, but frontend expected a string
- **Fix**: Parse `detail` array in api-client to extract human-readable messages

### "Load failed" / "Authentication error"
- **Cause**: CORS blocking requests OR network failure
- **Fix**: Ensure backend CORS includes all frontend deployment URLs

### Missing Sign Out
- **Cause**: No logout button in UI
- **Fix**: Add Sign Out to sidebar and/or topbar user menu
