"""ESG Dashboard API - Main Application Entry Point

This module initializes the FastAPI application with enterprise-grade security,
database connectivity, caching, and routing for ESG analytics and predictions.
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
import uvicorn
import logging
import sys
from pathlib import Path

sys.path.append(str(Path(__file__).parent.parent))

from backend.core.config import settings
from backend.middleware.security import (
    SQLInjectionProtectionMiddleware,
    SecurityHeadersMiddleware,
    XSSProtectionMiddleware,
    setup_rate_limiting
)
from backend.routers import analytics, predictions, agents
from backend.services.database import db_service
from backend.services.cache import cache_service

# Configure logging
logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/api.log') if Path('logs').exists() else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)

# Initialize FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    description="Advanced ESG Analytics and Risk Prediction API with enterprise security",
    version=settings.VERSION,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

# Setup rate limiting
limiter = setup_rate_limiting(app)

# Add middleware in order (last added = first executed)
# Add middleware in order (last added = first executed)

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SQLInjectionProtectionMiddleware)
app.add_middleware(XSSProtectionMiddleware)

if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

# CORS must be the last one added so it's the first one executed (outermost layer)
cors_config = {
    "allow_origins": settings.CORS_ORIGINS,
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    "allow_headers": ["*"],
    "expose_headers": ["X-Total-Count", "X-Page-Count"],
}

# In development, allow all origins via regex to handle localhost vs 127.0.0.1 mismatches
if settings.ENVIRONMENT == "development":
    cors_config["allow_origin_regex"] = "https?://.*"
    cors_config["allow_origins"] = []

app.add_middleware(CORSMiddleware, **cors_config)

# Include routers
app.include_router(analytics.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")
app.include_router(agents.router)


@app.on_event("startup")
async def startup_event():
    """Initialize application resources on startup."""
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Cache available: {cache_service.is_available()}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup resources on shutdown."""
    logger.info("🛑 Shutting down application")
    db_service.close_pool()


@app.get("/health")
@limiter.limit("20/minute")
async def health_check(request: Request):
    """Health check endpoint for monitoring and load balancers."""
    db_status = db_service.get_health_status()
    return {
        "status": "healthy" if db_status["status"] == "healthy" else "degraded",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
        "database": db_status,
        "cache": {
            "status": "available" if cache_service.is_available() else "unavailable"
        }
    }


@app.get("/")
async def root():
    """Root endpoint providing API information."""
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs_url": "/api/docs" if settings.ENVIRONMENT != "production" else None,
        "health_url": "/health",
        "analytics_prefix": "/api/analytics",
        "predictions_prefix": "/api/predict"
    }


if __name__ == "__main__":
    uvicorn.run(
        "backend.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
