# Setup Guide

## Prerequisites

- Python 3.11+
- Node.js 18+
- Docker & Docker Compose (for Postgres)

## Development

### 1. Database

Run Postgres via Docker:

```bash
docker-compose up -d
```

### 2. Backend

The backend runs on port 8001 by default to avoid conflicts.

```bash
# Setup env
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Config
export DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5433/omnitrack_db"
export JWT_SECRET_KEY="dev_secret"

# Run (standardized script)
../scripts/start_backend.sh
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

## Verification

Run smoke tests to verify api health:

```bash
./scripts/smoke_api.sh
```
