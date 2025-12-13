# Architecture Overview

OmniTrackIQ is a modern SaaS application for e-commerce analytics.

## Tech Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Python FastAPI, SQLAlchemy, Pydantic
- **Database**: PostgreSQL
- **Infrastructure**: Render (Docker)

## High-Level Components

### Frontend (`/frontend`)

The client-side application handles:

- Marketing pages (SSG/ISR)
- Authenticated Dashboard (Client-side rendering with some Server Components)
- Authentication context and protected routes

### Backend (`/backend`)

The API server handles:

- REST API endpoints (`/api/v1/...`)
- logical business operations
- Database interactions
- Third-party integrations (Shopify, Facebook Ads, etc.)

## Data Flow

1. **User Action** -> Frontend Component
2. **API Call** -> `api-client.ts` -> Backend API
3. **Processing** -> Service Layer -> Database
4. **Response** -> JSON -> Frontend State Update
