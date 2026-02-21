"""
Per-user sliding window rate limiter backed by Redis sorted sets (ZSETs).

Algorithm: Each request adds a member (scored by timestamp) to a ZSET keyed
by user + window. A Lua script atomically removes expired entries, counts
the remaining, and conditionally adds the new entry — preventing race
conditions across concurrent requests or multiple service instances.

Usage: Add `dependencies=[Depends(require_rate_limit)]` to FastAPI endpoints.
"""

import logging
import time
import uuid

from fastapi import HTTPException, Request

from app.core.config import (
    RATE_LIMIT_PER_DAY,
    RATE_LIMIT_PER_HOUR,
    RATE_LIMIT_PER_MINUTE,
)
from app.core.redis_client import get_redis

logger = logging.getLogger("pulse.rate_limiter")

# Lua script for atomic sliding-window check.
# KEYS[1] = sorted set key
# ARGV[1] = window_start (now - window_seconds)
# ARGV[2] = now (score for new member)
# ARGV[3] = unique member id
# ARGV[4] = max allowed count
# ARGV[5] = key TTL (= window_seconds, for auto-cleanup)
# Returns: [current_count, was_allowed (0|1)]
_LUA_SLIDING_WINDOW = """
local key = KEYS[1]
local window_start = tonumber(ARGV[1])
local now = tonumber(ARGV[2])
local member = ARGV[3]
local max_count = tonumber(ARGV[4])
local ttl = tonumber(ARGV[5])

redis.call('ZREMRANGEBYSCORE', key, '-inf', window_start)

local count = redis.call('ZCARD', key)

if count < max_count then
    redis.call('ZADD', key, now, member)
    redis.call('EXPIRE', key, ttl)
    return {count + 1, 1}
end

return {count, 0}
"""

# (window_name, window_seconds, config_getter)
_WINDOWS = [
    ("minute", 60, lambda: RATE_LIMIT_PER_MINUTE),
    ("hour", 3600, lambda: RATE_LIMIT_PER_HOUR),
    ("day", 86400, lambda: RATE_LIMIT_PER_DAY),
]


async def _check_rate_limit(user_id: str) -> None:
    """
    Check all sliding windows for the user. Raises 429 on first violation.
    """
    redis_client = get_redis()
    now = time.time()
    member = f"{now}:{uuid.uuid4().hex[:8]}"

    for window_name, window_seconds, get_limit in _WINDOWS:
        limit = get_limit()
        if limit <= 0:
            continue  # 0 = disabled

        key = f"ratelimit:{user_id}:{window_name}"
        window_start = now - window_seconds

        result = await redis_client.eval(
            _LUA_SLIDING_WINDOW,
            1,
            key,
            str(window_start),
            str(now),
            member,
            str(limit),
            str(window_seconds),
        )

        current_count, was_allowed = int(result[0]), int(result[1])

        if not was_allowed:
            # Calculate Retry-After from the oldest entry in the window
            oldest = await redis_client.zrange(key, 0, 0, withscores=True)
            if oldest:
                retry_after = int(oldest[0][1] + window_seconds - now) + 1
            else:
                retry_after = window_seconds
            retry_after = max(1, retry_after)

            logger.warning(
                "Rate limit exceeded | user=%s window=%s count=%d limit=%d retry_after=%ds",
                user_id,
                window_name,
                current_count,
                limit,
                retry_after,
            )

            raise HTTPException(
                status_code=429,
                detail={
                    "error": "rate_limit_exceeded",
                    "message": (
                        f"Too many requests. You have exceeded the "
                        f"{window_name} limit of {limit} requests."
                    ),
                    "window": window_name,
                    "limit": limit,
                    "retry_after_seconds": retry_after,
                },
                headers={"Retry-After": str(retry_after)},
            )

        logger.debug(
            "Rate limit OK | user=%s window=%s count=%d/%d",
            user_id,
            window_name,
            current_count,
            limit,
        )


async def require_rate_limit(request: Request) -> None:
    """
    FastAPI dependency extracts userId from the parsed request body
    and enforces per-minute, per-hour, and per-day sliding-window limits.
    """
    body = await request.json()
    user_id = body.get("userId")

    if not user_id:

        return

    await _check_rate_limit(user_id)
