from typing import Optional

from pydantic import AnyUrl, BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: AnyUrl

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    FRONTEND_ORIGINS: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

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

    class Config:
        env_file = ".env"


settings = Settings()
