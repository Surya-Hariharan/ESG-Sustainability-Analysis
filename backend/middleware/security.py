from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
import re
from typing import Callable
import logging

logger = logging.getLogger(__name__)

limiter = Limiter(key_func=get_remote_address, default_limits=["100/minute"])


class SQLInjectionProtectionMiddleware(BaseHTTPMiddleware):
    """
    Simplified SQL injection protection middleware.
    Only checks for obvious SQL injection patterns in query parameters.
    Does NOT check request body to avoid blocking legitimate JSON/API requests.
    """
    SQL_INJECTION_PATTERNS = [
        r"(\bUNION\b.*\bSELECT\b)",  # UNION SELECT attacks
        r"(\bDROP\b.*\bTABLE\b)",     # DROP TABLE attacks
        r"(;.*\b(SELECT|DELETE|UPDATE|INSERT)\b)",  # Multiple statements
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Only check query parameters, not request body
        # This prevents false positives on JSON requests
        query_params = str(request.query_params)
        for pattern in self.SQL_INJECTION_PATTERNS:
            if re.search(pattern, query_params, re.IGNORECASE):
                logger.warning(f"Potential SQL injection in query params from {request.client.host}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid query parameters"
                )
        
        response = await call_next(request)
        return response


class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next: Callable):
        response = await call_next(request)
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
        response.headers["Content-Security-Policy"] = "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline';"
        response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
        response.headers["Permissions-Policy"] = "geolocation=(), microphone=(), camera=()"
        return response


class XSSProtectionMiddleware(BaseHTTPMiddleware):
    """
    Simplified XSS protection middleware.
    Only checks for the most dangerous XSS patterns.
    Allows normal text content including common words like 'select', 'or', 'and'.
    """
    XSS_PATTERNS = [
        r"<script[^>]*>",           # Script tags
        r"javascript:\s*",          # JavaScript protocol
        r"<iframe[^>]*>",           # Iframe tags
        r"onerror\s*=\s*['\"]",     # Event handlers with quotes
        r"onload\s*=\s*['\"]",
    ]
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Only check POST/PUT/PATCH requests
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()
            body_str = body.decode('utf-8', errors='ignore')
            
            for pattern in self.XSS_PATTERNS:
                if re.search(pattern, body_str, re.IGNORECASE):
                    logger.warning(f"Potential XSS attempt from {request.client.host}")
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="Invalid input detected"
                    )
        
        response = await call_next(request)
        return response


def setup_rate_limiting(app):
    app.state.limiter = limiter
    app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
    return limiter
