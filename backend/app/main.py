import logging
import os
import time
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded

from app.config import settings
from app.routers import routes_auth, routes_billing, routes_health, routes_integrations, routes_metrics, routes_team, routes_saved_views, routes_sample_data, routes_scheduled_reports, routes_jobs, routes_custom_reports, routes_funnel, routes_anomaly, routes_notifications, routes_onboarding
from app.routers import routes_websocket
from app.security.rate_limit import limiter

# Configure structured logging
LOG_LEVEL = os.getenv("LOG_LEVEL", "INFO").upper()
logging.basicConfig(
    level=getattr(logging, LOG_LEVEL, logging.INFO),
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger("omnitrackiq")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan - startup and shutdown events."""
    logger.info("OmniTrackIQ API starting up...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'production')}")
    logger.info(f"Log level: {LOG_LEVEL}")
    
    # Start background job scheduler
    from app.jobs.scheduler import start_scheduler, shutdown_scheduler
    try:
        start_scheduler()
        logger.info("Background job scheduler started")
    except Exception as e:
        logger.error(f"Failed to start scheduler: {e}")
    
    yield
    
    # Shutdown scheduler
    try:
        shutdown_scheduler()
        logger.info("Background job scheduler stopped")
    except Exception as e:
        logger.error(f"Error stopping scheduler: {e}")
    
    logger.info("OmniTrackIQ API shutting down...")


app = FastAPI(
    title="OmniTrackIQ API",
    description="""
## OmniTrackIQ - Enterprise Marketing Analytics Platform

OmniTrackIQ is a comprehensive B2B SaaS marketing analytics platform for e-commerce brands.

### Features

* **Multi-platform Ad Tracking** - Connect Facebook, Google, TikTok, and more
* **Multi-touch Attribution** - 5 attribution models (first touch, last touch, linear, time decay, position based)
* **Cohort Analysis** - Customer retention heatmaps and revenue cohorts  
* **Custom Report Builder** - Build reports with 12 metrics and 6 dimensions
* **Funnel Visualization** - Track conversion from impressions to purchase
* **Anomaly Detection** - AI-powered detection of metric anomalies
* **Scheduled Reports** - Email reports on your schedule (daily, weekly, monthly)
* **Real-time Dashboards** - Live metrics with customizable views

### Authentication

All API endpoints (except health checks) require JWT Bearer token authentication.

```
Authorization: Bearer <your-jwt-token>
```

### Rate Limits

- Authentication endpoints: 5 requests/minute
- Data endpoints: 100 requests/minute  
- Export endpoints: 10 requests/minute

### Support

For API support, contact: api-support@omnitrackiq.com
""",
    version=os.getenv("APP_VERSION", "1.0.0"),
    lifespan=lifespan,
    openapi_tags=[
        {
            "name": "Health",
            "description": "Health check and system status endpoints",
        },
        {
            "name": "Authentication", 
            "description": "User authentication, signup, login, and session management",
        },
        {
            "name": "Metrics",
            "description": "Core analytics metrics - revenue, spend, ROAS, campaigns, and orders",
        },
        {
            "name": "Attribution",
            "description": "Multi-touch attribution analysis with 5 models",
        },
        {
            "name": "Cohorts",
            "description": "Customer cohort analysis and retention tracking",
        },
        {
            "name": "Funnel",
            "description": "Conversion funnel visualization and analysis",
        },
        {
            "name": "Anomalies",
            "description": "AI-powered anomaly detection in marketing metrics",
        },
        {
            "name": "Custom Reports",
            "description": "Create, manage, and execute custom analytics reports",
        },
        {
            "name": "Integrations",
            "description": "Connect ad platforms (Facebook, Google, TikTok, etc.)",
        },
        {
            "name": "Scheduled Reports",
            "description": "Schedule automated email reports",
        },
        {
            "name": "Saved Views",
            "description": "Save and manage dashboard view configurations",
        },
        {
            "name": "Team",
            "description": "Team management and user invitations",
        },
        {
            "name": "Billing",
            "description": "Subscription and payment management via Stripe",
        },
        {
            "name": "Jobs",
            "description": "Background job status and management",
        },
        {
            "name": "Sample Data",
            "description": "Generate sample data for testing and demos",
        },
        {
            "name": "WebSocket",
            "description": "Real-time updates via WebSocket connections",
        },
        {
            "name": "Notifications",
            "description": "Notification preferences and in-app alerts",
        },
        {
            "name": "Onboarding",
            "description": "Workspace onboarding flow and progress tracking",
        },
    ],
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
)

# Add rate limiter
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)


# Request timing and logging middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """Log all requests with timing information."""
    start_time = time.time()
    
    # Process request
    try:
        response = await call_next(request)
    except Exception as e:
        logger.error(
            f"Request failed | {request.method} {request.url.path} | Error: {str(e)}"
        )
        raise
    
    # Calculate duration
    duration_ms = (time.time() - start_time) * 1000
    
    # Log request (skip health checks to reduce noise)
    if not request.url.path.startswith("/health"):
        log_level = logging.WARNING if response.status_code >= 400 else logging.INFO
        logger.log(
            log_level,
            f"{request.method} {request.url.path} | {response.status_code} | {duration_ms:.1f}ms"
        )
    
    # Add timing header
    response.headers["X-Response-Time"] = f"{duration_ms:.1f}ms"
    return response


# Global exception handler
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catch unhandled exceptions and return a clean error response."""
    logger.exception(f"Unhandled exception on {request.method} {request.url.path}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An unexpected error occurred. Please try again later."},
    )


# CORS origins for local development and production
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "https://omnitrackiq.com",
    "https://www.omnitrackiq.com",
    "https://omnitrackiq.onrender.com",
    "https://omnitrackiq-frontend.onrender.com",
]

# Add FRONTEND_URL to origins if set
if settings.FRONTEND_URL and settings.FRONTEND_URL not in origins:
    origins.append(settings.FRONTEND_URL)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Base URL for frontend redirects
BASE_URL = settings.FRONTEND_URL

# Include routers
app.include_router(routes_health.router, prefix="/health", tags=["Health"])
app.include_router(routes_auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(routes_billing.router, prefix="/billing", tags=["Billing"])
app.include_router(routes_integrations.router, prefix="/integrations", tags=["Integrations"])
app.include_router(routes_metrics.router, prefix="/metrics", tags=["Metrics"])
app.include_router(routes_team.router, prefix="/team", tags=["Team"])
app.include_router(routes_saved_views.router, prefix="/saved-views", tags=["Saved Views"])
app.include_router(routes_sample_data.router, prefix="/sample-data", tags=["Sample Data"])
app.include_router(routes_scheduled_reports.router, prefix="/scheduled-reports", tags=["Scheduled Reports"])
app.include_router(routes_jobs.router, prefix="/jobs", tags=["Jobs"])
app.include_router(routes_custom_reports.router, prefix="/custom-reports", tags=["Custom Reports"])
app.include_router(routes_funnel.router, prefix="/funnel", tags=["Funnel"])
app.include_router(routes_anomaly.router, prefix="/anomalies", tags=["Anomalies"])
app.include_router(routes_notifications.router, prefix="/notifications", tags=["Notifications"])
app.include_router(routes_onboarding.router, prefix="/onboarding", tags=["Onboarding"])
app.include_router(routes_websocket.router, tags=["WebSocket"])


# Root endpoint
@app.get("/")
def root():
    """Root endpoint - redirects to docs or returns basic info."""
    return {
        "name": "OmniTrackIQ API",
        "version": os.getenv("APP_VERSION", "1.0.0"),
        "docs": "/docs",
        "health": "/health",
        "status": "/health/status",
    }
