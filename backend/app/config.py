from typing import List, Optional

from pydantic import AnyUrl
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    # pydantic-settings v2 style config
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
    )

    DATABASE_URL: AnyUrl

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    FRONTEND_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ]

    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str

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


settings = Settings()