import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI, Request

from app.core.logging_config import setup_logging
from app.core.redis_client import init_redis, close_redis
from app.routers.routine import router as routine_router

setup_logging()
logger = logging.getLogger("pulse.app")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Manage startup/shutdown resources (Redis pool)."""
    logger.info("Starting Pulse AI Orchestrator — connecting to Redis")
    try:
        await init_redis()
        logger.info("Redis connected")
    except Exception as e:
        logger.warning("Redis unavailable (%s) — rate limiting disabled", e)
    yield
    logger.info("Shutting down — closing Redis pool")
    await close_redis()


app = FastAPI(title="Pulse AI Orchestrator", lifespan=lifespan)


@app.middleware("http")
async def cache_request_body(request: Request, call_next):
    await request.body()
    return await call_next(request)


@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-orchestrator"}


app.include_router(routine_router, prefix="/routine")
