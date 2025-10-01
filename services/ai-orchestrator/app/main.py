from fastapi import FastAPI
from app.routers.plan import router as plan_router

app = FastAPI(title="Pulse AI Orchestrator")

@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-orchestrator"}

app.include_router(plan_router, prefix="/plan")