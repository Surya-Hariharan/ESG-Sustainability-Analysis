import redis
import json
import os
import logging
from typing import Any, Optional
from functools import wraps
import hashlib

logger = logging.getLogger(__name__)


class CacheService:
    _instance = None
    _redis_client = None
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CacheService, cls).__new__(cls)
            cls._instance._initialize_redis()
        return cls._instance
    
    def _initialize_redis(self):
        try:
            redis_host = os.getenv("REDIS_HOST", "localhost")
            redis_port = int(os.getenv("REDIS_PORT", 6379))
            redis_db = int(os.getenv("REDIS_DB", 0))
            
            self._redis_client = redis.Redis(
                host=redis_host,
                port=redis_port,
                db=redis_db,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5
            )
            
            self._redis_client.ping()
            logger.info("✅ Redis cache initialized")
        except Exception as e:
            logger.warning(f"⚠️  Redis not available: {e}. Caching disabled.")
            self._redis_client = None
    
    def is_available(self) -> bool:
        return self._redis_client is not None
    
    def get(self, key: str) -> Optional[Any]:
        if not self.is_available():
            return None
        
        try:
            value = self._redis_client.get(key)
            if value:
                return json.loads(value)
        except Exception as e:
            logger.error(f"Cache get error: {e}")
        return None
    
    def set(self, key: str, value: Any, ttl: int = 300):
        if not self.is_available():
            return
        
        try:
            self._redis_client.setex(
                key,
                ttl,
                json.dumps(value, default=str)
            )
        except Exception as e:
            logger.error(f"Cache set error: {e}")
    
    def delete(self, key: str):
        if not self.is_available():
            return
        
        try:
            self._redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache delete error: {e}")
    
    def clear_pattern(self, pattern: str):
        if not self.is_available():
            return
        
        try:
            for key in self._redis_client.scan_iter(match=pattern):
                self._redis_client.delete(key)
        except Exception as e:
            logger.error(f"Cache clear pattern error: {e}")
    
    @staticmethod
    def generate_cache_key(prefix: str, *args, **kwargs) -> str:
        key_data = f"{prefix}:{args}:{sorted(kwargs.items())}"
        return hashlib.md5(key_data.encode()).hexdigest()


cache_service = CacheService()


def cache_response(ttl: int = 300, key_prefix: str = "api"):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            if not cache_service.is_available():
                return await func(*args, **kwargs)
            
            cache_key = cache_service.generate_cache_key(key_prefix, *args, **kwargs)
            
            cached_value = cache_service.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            result = await func(*args, **kwargs)
            cache_service.set(cache_key, result, ttl)
            logger.debug(f"Cache miss: {cache_key}")
            
            return result
        return wrapper
    return decorator
