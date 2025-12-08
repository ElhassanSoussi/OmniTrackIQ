"""
Redis caching service for OmniTrackIQ.

Provides a caching layer for expensive database queries and API responses.
Falls back gracefully when Redis is unavailable.
"""
import json
import hashlib
import logging
from datetime import timedelta
from typing import Any, Callable, Optional, TypeVar, Union
from functools import wraps

try:
    import redis
    REDIS_AVAILABLE = True
except ImportError:
    REDIS_AVAILABLE = False
    redis = None

from app.config import settings

logger = logging.getLogger(__name__)

T = TypeVar('T')

# Default TTL values for different cache types
CACHE_TTL = {
    "metrics_summary": timedelta(minutes=5),
    "campaigns": timedelta(minutes=10),
    "orders": timedelta(minutes=5),
    "funnel": timedelta(minutes=15),
    "anomalies": timedelta(minutes=30),
    "attribution": timedelta(minutes=30),
    "cohorts": timedelta(hours=1),
    "custom_report": timedelta(minutes=10),
    "metadata": timedelta(hours=24),
    "default": timedelta(minutes=5),
}


class CacheService:
    """Redis-based caching service with graceful fallback."""
    
    _instance: Optional['CacheService'] = None
    _client: Optional['redis.Redis'] = None
    _enabled: bool = False
    
    def __new__(cls):
        """Singleton pattern for cache service."""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
            cls._instance._initialize()
        return cls._instance
    
    def _initialize(self):
        """Initialize Redis connection."""
        if not REDIS_AVAILABLE:
            logger.warning("Redis package not installed. Caching disabled.")
            self._enabled = False
            return
        
        redis_url = getattr(settings, 'REDIS_URL', None)
        if not redis_url:
            logger.info("REDIS_URL not configured. Caching disabled.")
            self._enabled = False
            return
        
        try:
            self._client = redis.from_url(
                redis_url,
                decode_responses=True,
                socket_connect_timeout=5,
                socket_timeout=5,
            )
            # Test connection
            self._client.ping()
            self._enabled = True
            logger.info("Redis cache connected successfully")
        except Exception as e:
            logger.warning(f"Failed to connect to Redis: {e}. Caching disabled.")
            self._enabled = False
            self._client = None
    
    @property
    def enabled(self) -> bool:
        """Check if caching is enabled."""
        return self._enabled and self._client is not None
    
    def _make_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a cache key from prefix and arguments."""
        # Create a deterministic key from all arguments
        key_parts = [str(arg) for arg in args]
        key_parts.extend(f"{k}={v}" for k, v in sorted(kwargs.items()) if v is not None)
        key_data = ":".join(key_parts)
        
        # Hash long keys to keep them manageable
        if len(key_data) > 100:
            key_hash = hashlib.md5(key_data.encode()).hexdigest()[:16]
            return f"omnitrackiq:{prefix}:{key_hash}"
        
        return f"omnitrackiq:{prefix}:{key_data}"
    
    def get(self, key: str) -> Optional[Any]:
        """Get a value from cache."""
        if not self.enabled:
            return None
        
        try:
            data = self._client.get(key)
            if data:
                return json.loads(data)
            return None
        except Exception as e:
            logger.warning(f"Cache get error for {key}: {e}")
            return None
    
    def set(
        self, 
        key: str, 
        value: Any, 
        ttl: Optional[Union[int, timedelta]] = None
    ) -> bool:
        """Set a value in cache with optional TTL."""
        if not self.enabled:
            return False
        
        try:
            if ttl is None:
                ttl = CACHE_TTL["default"]
            
            if isinstance(ttl, timedelta):
                ttl = int(ttl.total_seconds())
            
            self._client.setex(key, ttl, json.dumps(value, default=str))
            return True
        except Exception as e:
            logger.warning(f"Cache set error for {key}: {e}")
            return False
    
    def delete(self, key: str) -> bool:
        """Delete a value from cache."""
        if not self.enabled:
            return False
        
        try:
            self._client.delete(key)
            return True
        except Exception as e:
            logger.warning(f"Cache delete error for {key}: {e}")
            return False
    
    def delete_pattern(self, pattern: str) -> int:
        """Delete all keys matching a pattern."""
        if not self.enabled:
            return 0
        
        try:
            keys = self._client.keys(f"omnitrackiq:{pattern}")
            if keys:
                return self._client.delete(*keys)
            return 0
        except Exception as e:
            logger.warning(f"Cache delete pattern error for {pattern}: {e}")
            return 0
    
    def invalidate_account(self, account_id: str) -> int:
        """Invalidate all cache entries for an account."""
        return self.delete_pattern(f"*:{account_id}:*")
    
    def invalidate_metrics(self, account_id: str) -> int:
        """Invalidate metrics cache for an account."""
        deleted = 0
        for prefix in ["metrics", "funnel", "anomalies", "attribution", "cohorts"]:
            deleted += self.delete_pattern(f"{prefix}:{account_id}:*")
        return deleted
    
    def get_stats(self) -> dict:
        """Get cache statistics."""
        if not self.enabled:
            return {"enabled": False}
        
        try:
            info = self._client.info("stats")
            memory = self._client.info("memory")
            return {
                "enabled": True,
                "hits": info.get("keyspace_hits", 0),
                "misses": info.get("keyspace_misses", 0),
                "memory_used": memory.get("used_memory_human", "N/A"),
                "connected_clients": self._client.info("clients").get("connected_clients", 0),
            }
        except Exception as e:
            logger.warning(f"Failed to get cache stats: {e}")
            return {"enabled": True, "error": str(e)}


# Global cache instance
cache = CacheService()


def cached(
    prefix: str,
    ttl: Optional[Union[int, timedelta]] = None,
    key_builder: Optional[Callable[..., str]] = None,
):
    """
    Decorator to cache function results.
    
    Usage:
        @cached("metrics_summary", ttl=timedelta(minutes=5))
        def get_metrics(account_id: str, from_date: date, to_date: date):
            # expensive operation
            return result
    
    Args:
        prefix: Cache key prefix (e.g., "metrics_summary")
        ttl: Time to live (defaults to CACHE_TTL[prefix] or default)
        key_builder: Optional custom function to build cache key
    """
    if ttl is None:
        ttl = CACHE_TTL.get(prefix, CACHE_TTL["default"])
    
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            if not cache.enabled:
                return func(*args, **kwargs)
            
            # Build cache key
            if key_builder:
                cache_key = key_builder(*args, **kwargs)
            else:
                # Default key builder - skip 'db' and 'Session' args
                filtered_args = [
                    arg for arg in args 
                    if not (hasattr(arg, '__class__') and 
                           arg.__class__.__name__ in ('Session', 'scoped_session'))
                ]
                filtered_kwargs = {
                    k: v for k, v in kwargs.items() 
                    if k not in ('db',)
                }
                cache_key = cache._make_key(prefix, *filtered_args, **filtered_kwargs)
            
            # Try to get from cache
            cached_value = cache.get(cache_key)
            if cached_value is not None:
                logger.debug(f"Cache hit: {cache_key}")
                return cached_value
            
            # Execute function and cache result
            logger.debug(f"Cache miss: {cache_key}")
            result = func(*args, **kwargs)
            
            # Cache the result
            cache.set(cache_key, result, ttl)
            
            return result
        
        return wrapper
    return decorator


def invalidate_on_write(cache_prefixes: list[str]):
    """
    Decorator to invalidate cache entries after a write operation.
    
    Usage:
        @invalidate_on_write(["metrics", "funnel"])
        def create_order(db, account_id, order_data):
            # create order
            return order
    
    Args:
        cache_prefixes: List of cache prefixes to invalidate
    """
    def decorator(func: Callable[..., T]) -> Callable[..., T]:
        @wraps(func)
        def wrapper(*args, **kwargs) -> T:
            result = func(*args, **kwargs)
            
            # Try to find account_id in args or kwargs
            account_id = kwargs.get('account_id')
            if not account_id and len(args) > 1:
                # Assume second arg might be account_id (after db)
                account_id = args[1] if isinstance(args[1], str) else None
            
            if account_id and cache.enabled:
                for prefix in cache_prefixes:
                    cache.delete_pattern(f"{prefix}:{account_id}:*")
                logger.debug(f"Invalidated cache for {cache_prefixes} on account {account_id}")
            
            return result
        
        return wrapper
    return decorator
