"""
Async Redis connection pool for the AI orchestrator.

The pool is created at app startup (init_redis) and closed at shutdown
(close_redis). All modules import get_redis() to obtain the shared client.
"""

import redis.asyncio as redis

from app.core.config import REDIS_URL

_pool: redis.Redis | None = None


async def init_redis() -> redis.Redis:
    """Create the shared async Redis connection pool."""
    global _pool
    _pool = redis.from_url(
        REDIS_URL,
        decode_responses=True,
        max_connections=20,
    )
    await _pool.ping()
    return _pool


async def close_redis() -> None:
    """Close the Redis connection pool."""
    global _pool
    if _pool:
        await _pool.aclose()
        _pool = None


def get_redis() -> redis.Redis:
    """Return the active Redis client. Raises if not initialised."""
    if _pool is None:
        raise RuntimeError("Redis pool not initialised — call init_redis() first")
    return _pool
