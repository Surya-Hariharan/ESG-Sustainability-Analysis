from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
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
from backend.routers import analytics, predictions
from backend.services.database import db_service
from backend.services.cache import cache_service

logging.basicConfig(
    level=settings.LOG_LEVEL,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler('logs/api.log') if Path('logs').exists() else logging.NullHandler()
    ]
)

logger = logging.getLogger(__name__)

app = FastAPI(
    title=settings.APP_NAME,
    description="Advanced ESG Analytics and Risk Prediction API with enterprise security",
    version=settings.VERSION,
    docs_url="/api/docs" if settings.ENVIRONMENT != "production" else None,
    redoc_url="/api/redoc" if settings.ENVIRONMENT != "production" else None,
)

limiter = setup_rate_limiting(app)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
    expose_headers=["X-Total-Count", "X-Page-Count"],
)

if settings.ENVIRONMENT == "production":
    app.add_middleware(
        TrustedHostMiddleware,
        allowed_hosts=settings.ALLOWED_HOSTS
    )

app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(SQLInjectionProtectionMiddleware)
app.add_middleware(XSSProtectionMiddleware)

app.include_router(analytics.router, prefix="/api")
app.include_router(predictions.router, prefix="/api")


@app.on_event("startup")
async def startup_event():
    logger.info(f"🚀 Starting {settings.APP_NAME} v{settings.VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")
    logger.info(f"Cache available: {cache_service.is_available()}")


@app.on_event("shutdown")
async def shutdown_event():
    logger.info("🛑 Shutting down application")
    db_service.close_pool()


@app.get("/health")
@limiter.limit("20/minute")
async def health_check(request: Request):
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
    return {
        "message": f"Welcome to {settings.APP_NAME}",
        "version": settings.VERSION,
        "docs": "/api/docs" if settings.ENVIRONMENT != "production" else None
    }


@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    uvicorn.run(
        "app_v2:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
