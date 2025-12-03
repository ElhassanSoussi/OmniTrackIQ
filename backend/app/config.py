from pydantic import AnyUrl, BaseSettings


class Settings(BaseSettings):
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

    class Config:
        env_file = ".env"


settings = Settings()
