from fastapi import APIRouter
from pydantic import BaseModel
from typing import List, Any, Dict

router = APIRouter(tags=["plan"])

class GenerateRequest(BaseModel):
    userId: str
    profile: Dict[str, Any]
    history: List[Dict[str, Any]] = []

@router.post("/generate")
def generate_plan(req: GenerateRequest):
    # Placeholder plan (replace with Langflow/OpenAI call)
    plan = {
        "version": 1,
        "days": [
            {"day": "Mon", "workout": [{"name":"Squat","sets":3,"reps":10}]},
            {"day": "Wed", "workout": [{"name":"Bench","sets":3,"reps":10}]},
            {"day": "Fri", "workout": [{"name":"Deadlift","sets":3,"reps":5}]}
        ]
    }
    return {"plan": plan, "userId": req.userId}