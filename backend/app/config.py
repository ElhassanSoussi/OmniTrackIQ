from typing import Optional

from pydantic import field_validator
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # Core app config - use str instead of AnyUrl to avoid SQLAlchemy issues
    DATABASE_URL: str

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # Redis cache (optional)
    REDIS_URL: Optional[str] = None

    # Stripe
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Frontend URL for CORS and redirects
    FRONTEND_URL: str = "https://omnitrackiq.com"

    # Integrations (all optional)
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None

    GOOGLE_ADS_CLIENT_ID: Optional[str] = None
    GOOGLE_ADS_CLIENT_SECRET: Optional[str] = None

    TIKTOK_CLIENT_ID: Optional[str] = None
    TIKTOK_CLIENT_SECRET: Optional[str] = None

    GITHUB_CLIENT_ID: Optional[str] = None
    GITHUB_CLIENT_SECRET: Optional[str] = None

    APPLE_CLIENT_ID: Optional[str] = None
    APPLE_CLIENT_SECRET: Optional[str] = None

    SHOPIFY_CLIENT_ID: Optional[str] = None
    SHOPIFY_CLIENT_SECRET: Optional[str] = None

    GA4_CLIENT_EMAIL: Optional[str] = None
    GA4_PRIVATE_KEY: Optional[str] = None

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://your-frontend-domain.com"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
