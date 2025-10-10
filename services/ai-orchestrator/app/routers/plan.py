from fastapi import APIRouter
from app.models.request import GenerateRequest

router = APIRouter(tags=["plan"])

# Placeholder for plan generation logic
@router.post("/generate")
def generate_plan(req: GenerateRequest):
    # Placeholder plan (will replace with Langflow/OpenAI call)
    plan = {
        "version": 1,
        "days": [
            {"day": "Mon", "workout": [{"name":"Squat","sets":3,"reps":10}]},
            {"day": "Wed", "workout": [{"name":"Bench","sets":3,"reps":10}]},
            {"day": "Fri", "workout": [{"name":"Deadlift","sets":3,"reps":5}]}
        ]
    }
    return {"plan": plan, "userId": req.userId}

@router.post("/adapt")
def adapt_plan(req: GenerateRequest):
    # Placeholder adapted plan (will replace with Langflow/OpenAI call)
    adapted_plan = {
        "version": 2,
        "days": [
            {"day": "Mon", "workout": [{"name":"Squat","sets":4,"reps":8}]},
            {"day": "Wed", "workout": [{"name":"Bench","sets":4,"reps":8}]},
            {"day": "Fri", "workout": [{"name":"Deadlift","sets":4,"reps":4}]}
        ]
    }
    return {"plan": adapted_plan, "userId": req.userId}

@router.get("/explain")
def explain_plan():
    # Placeholder explanation (will replace with AI chat explanation)
    explanation = "This plan focuses on compound lifts to build overall strength."
    return {"explanation": explanation} 