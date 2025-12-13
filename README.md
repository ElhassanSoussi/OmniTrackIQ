# OmniTrackIQ

**Unified marketing analytics & attribution for e-commerce brands and agencies.**

OmniTrackIQ is a SaaS platform that connects all your marketing data—Facebook Ads, Google Ads, TikTok Ads, Shopify, and GA4—into a single dashboard. Stop juggling spreadsheets and ad platform UIs. Get real-time ROAS, unified attribution, and actionable insights to scale your marketing confidently.

---

## ✨ Features

### Dashboards & Analytics

- **Overview Dashboard**: Real-time KPIs (revenue, ad spend, ROAS, orders, CAC) with date range filters
- **Campaigns**: Drill-down by platform, campaign, ad set, and ad with performance metrics
- **Orders**: Revenue attribution, order-level insights, and customer acquisition data
- **Anomaly Detection**: Automatic alerts when metrics deviate from normal patterns

### Integrations

- **Facebook Ads**: Campaign, ad set, and conversion data from Meta Ads Manager
- **Google Ads**: Search, Shopping, and Display campaign metrics
- **TikTok Ads**: Campaign performance and creative insights
- **Shopify**: Real-time order sync, revenue tracking, and customer data
- **Google Analytics 4**: Session data, event tracking, and behavior insights
- **n8n Workflows**: Extensible automation for custom data pipelines

### Billing & Subscriptions

- **Stripe Integration**: Secure checkout, subscription management, and billing portal
- **Plans**: Starter ($49/mo), Pro ($149/mo), Agency ($399/mo)
- **Free Trial**: 14-day trial on all plans

### Onboarding

- **Guided Setup**: Step-by-step workspace creation, integration connection, and dashboard tour
- **Checklist Banner**: Progress tracking until onboarding is complete

### Multi-Tenancy & Security

- **Workspace Isolation**: All data scoped by workspace (account)
- **Role-Based Access**: Owner, Admin, Member roles (team invites supported)
- **Secure Auth**: JWT-based authentication with bcrypt password hashing

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, React Query |
| **Backend** | FastAPI, SQLAlchemy, Alembic, PostgreSQL |
| **Billing** | Stripe (Checkout, Subscriptions, Webhooks) |
| **ETL/Automation** | n8n workflows |
| **Deployment** | Render (frontend + backend), PostgreSQL on Render |

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        OmniTrackIQ                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────┐      REST API      ┌──────────────┐          │
│  │   Next.js    │ ─────────────────► │   FastAPI    │          │
│  │   Frontend   │                    │   Backend    │          │
│  └──────────────┘                    └──────┬───────┘          │
│         │                                   │                   │
│         │                                   ▼                   │
│         │                            ┌──────────────┐          │
│         │                            │  PostgreSQL  │          │
│         │                            │   Database   │          │
│         │                            └──────────────┘          │
│         │                                   ▲                   │
│         │                                   │                   │
│         │    ┌──────────────────────────────┤                   │
│         │    │                              │                   │
│         │    ▼                              │                   │
│  ┌──────────────┐                    ┌──────────────┐          │
│  │    Stripe    │                    │     n8n      │          │
│  │   Payments   │                    │  Workflows   │          │
│  └──────────────┘                    └──────────────┘          │
│                                             │                   │
│                                             ▼                   │
│                                 ┌─────────────────────┐        │
│                                 │   Ad Platforms      │        │
│                                 │  (FB, Google, TikTok│        │
│                                 │   Shopify, GA4)     │        │
│                                 └─────────────────────┘        │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

**Data Flow:**

1. Users interact with the Next.js frontend
2. Frontend calls FastAPI backend via REST API
3. Backend stores all data in PostgreSQL, scoped by workspace
4. n8n workflows sync data from ad platforms and Shopify
5. Stripe handles billing and subscription webhooks

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: 20.x (see `frontend/.nvmrc`)
- **Python**: 3.11+
- **PostgreSQL**: 14+

### Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your DATABASE_URL, JWT_SECRET_KEY, Stripe keys, etc.

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Set environment variables
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`.

👉 **See [docs/SETUP.md](docs/SETUP.md) for complete setup instructions including environment variables and third-party integrations.**

---

## 📦 Deployment

OmniTrackIQ is deployed on **Render** with:

- **Frontend**: Static Site or Web Service (Node 20.x)
- **Backend**: Web Service (Python 3.11)
- **Database**: Render PostgreSQL

### Quick Deploy

1. Push to `main` branch
2. Render auto-deploys both services
3. Migrations run automatically via build command

## 📚 Documentation

> **[Start Here: Documentation Index](./docs/INDEX.md)**

All specific guides, architecture notes, and engineering logs are available in the `docs/` folder.

### Quick Links

- [Setup Guide](./docs/SETUP.md)
- [Roadmap](./docs/ROADMAP.md)
- [Project Structure](./docs/PROJECT_STRUCTURE.md)
- [Security](./docs/SECURITY.md)

---

## 🔒 Security & Privacy

- **Workspace Isolation**: All analytics, billing, and user data is scoped by workspace
- **Authentication**: JWT tokens with 24-hour expiry, bcrypt password hashing
- **Data in Transit**: TLS/HTTPS required in production
- **Secrets Management**: All secrets via environment variables, never in repo
- **Access Control**: Role-based permissions (Owner, Admin, Member)

👉 **See [docs/SECURITY.md](docs/SECURITY.md) for security details.**

---

## 📋 Roadmap

| Phase | Status | Description |
|-------|--------|-------------|
| Phase 1 | ✅ Complete | Deep analytics (overview, campaigns, orders, attribution) |
| Phase 2 | ✅ Complete | Stripe billing (subscriptions, checkout, portal) |
| Phase 3 | ✅ Complete | Guided onboarding flow |
| Phase 4 | ✅ Complete | Professional marketing site |
| Phase 5 | 🔜 Planned | Advanced attribution models, AI insights |

👉 **See [docs/ROADMAP.md](docs/ROADMAP.md) for the full roadmap.**

---

## 📁 Repository Structure

```
omnitrackiq/
├── frontend/           # Next.js 14 app (marketing, auth, dashboard)
│   ├── src/
│   │   ├── app/        # App Router pages
│   │   ├── components/ # React components
│   │   ├── contexts/   # React contexts (auth, theme)
│   │   ├── hooks/      # Custom React hooks
│   │   └── lib/        # Utilities, API client
│   └── ...
├── backend/            # FastAPI service
│   ├── app/
│   │   ├── routers/    # API route handlers
│   │   ├── models/     # SQLAlchemy models
│   │   ├── schemas/    # Pydantic schemas
│   │   ├── services/   # Business logic
│   │   └── security/   # Auth utilities
│   ├── alembic/        # Database migrations
│   └── ...
├── n8n-flows/          # Exported n8n workflow JSON files
├── docs/               # Documentation
│   ├── SETUP.md        # Setup guide
│   ├── ROADMAP.md      # Product roadmap
│   └── SECURITY.md     # Security documentation
└── README.md           # This file
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📧 Support

- **Email**: <support@omnitrackiq.com>
- **Documentation**: [docs.omnitrackiq.com](https://docs.omnitrackiq.com)

---

## 📄 License

This project is proprietary software. All rights reserved.
