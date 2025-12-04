from typing import List, Optional

from pydantic import AnyUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # pydantic-settings v2 style config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",  # ignore unknown env vars instead of failing
    )

    # Core app config
    DATABASE_URL: AnyUrl

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    # CORS / frontend
    # Can be overridden via env FRONTEND_ORIGINS="https://a.com,https://b.com"
    FRONTEND_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    # Stripe – optional so missing env vars don't crash the app
    STRIPE_SECRET_KEY: Optional[str] = None
    STRIPE_WEBHOOK_SECRET: Optional[str] = None

    # Integrations (all optional)
    FACEBOOK_CLIENT_ID: Optional[str] = None
    FACEBOOK_CLIENT_SECRET: Optional[str] = None

    GOOGLE_ADS_CLIENT_ID: Optional[str] = None
    GOOGLE_ADS_CLIENT_SECRET: Optional[str] = None

    TIKTOK_CLIENT_ID: Optional[str] = None
    TIKTOK_CLIENT_SECRET: Optional[str] = None

    SHOPIFY_CLIENT_ID: Optional[str] = None
    SHOPIFY_CLIENT_SECRET: Optional[str] = None

    GA4_CLIENT_EMAIL: Optional[str] = None
    GA4_PRIVATE_KEY: Optional[str] = None

    @field_validator("FRONTEND_ORIGINS", mode="before")
    @classmethod
    def split_frontend_origins(cls, v):
        """
        Allow FRONTEND_ORIGINS to be given as a comma-separated string in env:
        FRONTEND_ORIGINS="https://a.com,https://b.com"
        """
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
