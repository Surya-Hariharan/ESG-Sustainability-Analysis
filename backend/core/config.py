from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import field_validator
from typing import List
import os


class Settings(BaseSettings):
    APP_NAME: str = "ESG Dashboard API"
    VERSION: str = "2.0.0"
    DEBUG: bool = False
    ENVIRONMENT: str = "development"
    
    DB_HOST: str = "localhost"
    DB_PORT: int = 5432
    DB_NAME: str = "esg_db"
    DB_USER: str = "postgres"
    DB_PASSWORD: str = ""
    
    NEWS_API_KEY: str = ""
    GROQ_API_KEY: str = ""
    OPENAI_API_KEY: str = ""
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    REDIS_DB: int = 0
    
    # Store as comma-separated strings, convert via property
    CORS_ORIGINS_STR: str = "http://localhost:8080,http://127.0.0.1:8080,http://localhost:3000,http://localhost:5173"
    ALLOWED_HOSTS_STR: str = "localhost,127.0.0.1"
    
    SECRET_KEY: str = "dev-secret-key-change-in-production"
    
    LOG_LEVEL: str = "INFO"
    
    RATE_LIMIT_PER_MINUTE: int = 100
    
    NEWS_CACHE_TTL: int = 3600
    AGENT_CACHE_TTL: int = 1800
    
    model_config = SettingsConfigDict(
        case_sensitive=True,
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    @property
    def CORS_ORIGINS(self) -> List[str]:
        """Parse CORS_ORIGINS as a list from comma-separated string."""
        return [origin.strip() for origin in self.CORS_ORIGINS_STR.split(",") if origin.strip()]
    
    @property
    def ALLOWED_HOSTS(self) -> List[str]:
        """Parse ALLOWED_HOSTS as a list from comma-separated string."""
        return [host.strip() for host in self.ALLOWED_HOSTS_STR.split(",") if host.strip()]
    
    def validate_api_keys(self) -> dict:
        """Validate that required API keys are configured"""
        status = {
            "news_api": bool(self.NEWS_API_KEY and self.NEWS_API_KEY != "your_newsapi_key_here"),
            "groq_api": bool(self.GROQ_API_KEY and self.GROQ_API_KEY != "your_groq_api_key_here"),
            "openai_api": bool(self.OPENAI_API_KEY)
        }
        return status


settings = Settings()
