from pydantic import AnyUrl, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env")

    DATABASE_URL: AnyUrl

    JWT_SECRET_KEY: str
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24

    STRIPE_SECRET_KEY: str
    STRIPE_WEBHOOK_SECRET: str

    FACEBOOK_CLIENT_ID: str | None = None
    FACEBOOK_CLIENT_SECRET: str | None = None
    GOOGLE_ADS_CLIENT_ID: str | None = None
    GOOGLE_ADS_CLIENT_SECRET: str | None = None
    TIKTOK_CLIENT_ID: str | None = None
    TIKTOK_CLIENT_SECRET: str | None = None
    SHOPIFY_CLIENT_ID: str | None = None
    SHOPIFY_CLIENT_SECRET: str | None = None
    GA4_CLIENT_EMAIL: str | None = None
    GA4_PRIVATE_KEY: str | None = None

    BACKEND_CORS_ORIGINS: list[str] = ["http://localhost:3000", "https://your-frontend-domain.com"]

    @field_validator("BACKEND_CORS_ORIGINS", mode="before")
    def assemble_cors_origins(cls, v):
        if isinstance(v, str):
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v


settings = Settings()
