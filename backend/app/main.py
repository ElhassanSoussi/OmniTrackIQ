from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import routes_auth, routes_billing, routes_health, routes_integrations, routes_metrics

app = FastAPI(title="OmniTrackIQ API")

# CORS origins for local development and production
origins = [
    "http://localhost:3000",
    "https://omnitrackiq.com",
    "https://www.omnitrackiq.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base URL for frontend redirects
BASE_URL = settings.FRONTEND_URL

app.include_router(routes_health.router, prefix="/health", tags=["health"])
app.include_router(routes_auth.router, prefix="/auth", tags=["auth"])
app.include_router(routes_billing.router, prefix="/billing", tags=["billing"])
app.include_router(routes_integrations.router, prefix="/integrations", tags=["integrations"])
app.include_router(routes_metrics.router, prefix="/metrics", tags=["metrics"])
