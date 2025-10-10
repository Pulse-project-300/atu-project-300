from fastapi import FastAPI
from app.routers.plan import router as plan_router

app = FastAPI(title="Pulse AI Orchestrator")

# Health check endpoint
@app.get("/health")
def health():
    return {"status": "ok", "service": "ai-orchestrator"}

app.include_router(plan_router, prefix="/plan") # Include the plan router