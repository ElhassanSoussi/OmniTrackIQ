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
from app.routers import routes_auth, routes_billing, routes_health, routes_integrations, routes_metrics, routes_team
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
    yield
    logger.info("OmniTrackIQ API shutting down...")


app = FastAPI(
    title="OmniTrackIQ API",
    description="Marketing analytics platform for e-commerce",
    version=os.getenv("APP_VERSION", "1.0.0"),
    lifespan=lifespan,
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
app.include_router(routes_health.router, prefix="/health", tags=["health"])
app.include_router(routes_auth.router, prefix="/auth", tags=["auth"])
app.include_router(routes_billing.router, prefix="/billing", tags=["billing"])
app.include_router(routes_integrations.router, prefix="/integrations", tags=["integrations"])
app.include_router(routes_metrics.router, prefix="/metrics", tags=["metrics"])
app.include_router(routes_team.router, prefix="/team", tags=["team"])


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
