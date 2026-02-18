from fastapi import FastAPI
from app.routers.routine import router as routine_router

app = FastAPI(title="Pulse AI Orchestrator")

# Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-orchestrator"}

app.include_router(routine_router, prefix="/routine")
