from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    APP_NAME: str = "SREAI"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True

    # Database
    DATABASE_URL: str = "sqlite+aiosqlite:///./sreai.db"

    # JWT
    JWT_SECRET_KEY: str = "sreai-super-secret-key-change-in-production-2024"
    JWT_ALGORITHM: str = "HS256"
    JWT_ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    JWT_REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    # Redis (optional)
    REDIS_URL: Optional[str] = None

    # AI / LLM
    OPENAI_API_KEY: Optional[str] = None
    ANTHROPIC_API_KEY: Optional[str] = None
    # "mock" (auto-upgrades when a provider key is set) | "openai" | "anthropic"
    AI_MODEL: str = "mock"

    # Credential encryption (Fernet key; auto-generated and persisted if empty)
    ENCRYPTION_KEY: Optional[str] = None

    # Telemetry collector
    TELEMETRY_INTERVAL_SECONDS: float = 3.0
    SSH_COMMAND_TIMEOUT: int = 10

    # CORS
    CORS_ORIGINS: str = "http://localhost:3000"

    class Config:
        env_file = ".env"


settings = Settings()
