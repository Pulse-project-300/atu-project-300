from fastapi import APIRouter, HTTPException
from app.models.request import GenerateRequest, ExplainRequest
from app.core.openai_client import explain_plan

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

@router.post("/explain")
async def explain_plan_endpoint(req: ExplainRequest):
    """
    Generate an AI-powered explanation of a workout plan.

    Uses OpenAI's GPT model to create a detailed, personalized explanation
    that helps users understand their workout plan's purpose and benefits.

    Args:
        req: ExplainRequest containing the plan and optional user context

    Returns:
        Dict with the AI-generated explanation

    Raises:
        HTTPException: If the OpenAI API call fails
    """
    try:
        # Call OpenAI to generate the explanation
        explanation = await explain_plan(req.plan, req.profile)
        return {"explanation": explanation}
    except Exception as e:
        # Handle API errors gracefully
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        ) 