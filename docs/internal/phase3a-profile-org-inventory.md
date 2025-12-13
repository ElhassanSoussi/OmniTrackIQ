# Phase 3A: Profile & Org Settings Inventory

## Routes/Pages Identified

| Route | Purpose | Status |
|-------|---------|--------|
| `/settings` | Profile/Account settings | Has UI, missing backend |
| `/settings/team` | Team management | Separate feature |
| `/settings/appearance` | Theme settings | Client-side only |
| `/settings/notifications` | Alert preferences | Separate feature |
| `/settings/views` | Saved dashboard views | Separate feature |
| `/settings/reports` | Scheduled reports | Separate feature |

## Frontend: `/settings` (Profile Page)

**File**: `frontend/src/app/(dashboard)/settings/page.tsx`
**Hook**: `useSettings.ts`

### API Calls Made

| Action | Endpoint | Method | Exists? |
|--------|----------|--------|---------|
| Load profile | `/auth/me` | GET | ✅ Yes |
| Update account | `/auth/update-account` | POST | ❌ No |
| Update email | `/auth/update-email` | POST | ❌ No |
| Update password | `/auth/update-password` | POST | ❌ No |

### Current `/auth/me` Response

```json
{
  "id": "uuid",
  "email": "user@example.com",
  "account_id": "uuid",
  "role": "owner",
  "name": "Display Name"
}
```

**Missing**: `account_name` (workspace name) - not returned by current endpoint.

## Data Models

### User Model

- `id`, `email`, `password_hash`, `account_id`, `role`, `name`
- `name` = display name (editable)

### Account Model

- `id`, `name`, `type`, `plan`, `max_users`
- `name` = workspace/organization name (editable)

## Implementation Plan

### Step 2: Backend

1. Add `account_name` to /auth/me response
2. Create `/auth/update-profile` endpoint (updates user.name)
3. Create `/auth/update-account` endpoint (updates account.name)
4. Create `/auth/update-email` endpoint (updates user.email)
5. Create `/auth/update-password` endpoint (verifies current, sets new)

### Step 3: Frontend

Frontend already has correct UI. Just ensure:

- Error handling displays properly
- Success toasts work
- Loading states work

## Verification Checklist

- [ ] `npm run lint` passes
- [ ] `npm run build` passes
- [ ] Backend starts cleanly
- [ ] Profile page loads user data
- [ ] Display name update persists
- [ ] Account name update persists
- [ ] Unit test for update endpoint
