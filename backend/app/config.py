from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    DATABASE_URL: str
    JWT_SECRET_KEY: str
    STRIPE_SECRET_KEY: str
    FRONTEND_URL: str = "https://omnitrackiq.com"

    class Config:
        env_file = ".env"


settings = Settings()
