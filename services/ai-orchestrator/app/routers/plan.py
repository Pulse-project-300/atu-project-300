from fastapi import APIRouter, HTTPException
from app.models.request import GenerateRequest, AdaptRequest, ExplainRequest
from app.core.openai_client import generate_plan, adapt_plan, explain_plan

router = APIRouter(tags=["plan"])


@router.post("/generate")
async def generate_plan_endpoint(req: GenerateRequest):
    """
    Generate a new AI-powered workout plan.

    Uses OpenAI's GPT model to create a structured, personalised workout plan
    based on the user's profile and optional workout history.
    """
    try:
        plan = await generate_plan(req.profile, req.history or [])
        return {"plan": plan, "userId": req.userId}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate plan: {str(e)}"
        )


@router.post("/adapt")
async def adapt_plan_endpoint(req: AdaptRequest):
    """
    Adapt an existing workout plan based on user feedback and progress.

    Uses OpenAI's GPT model to intelligently modify the current plan
    according to feedback, recent logs, and user profile.
    """
    try:
        plan = await adapt_plan(
            profile=req.profile,
            current_plan=req.currentPlan,
            feedback=req.feedback,
            current_version=req.currentVersion,
            recent_logs=req.recentLogs or [],
        )
        return {"plan": plan, "userId": req.userId}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to adapt plan: {str(e)}"
        )


@router.post("/explain")
async def explain_plan_endpoint(req: ExplainRequest):
    """
    Generate an AI-powered explanation of a workout plan.

    Uses OpenAI's GPT model to create a detailed, personalized explanation
    that helps users understand their workout plan's purpose and benefits.
    """
    try:
        explanation = await explain_plan(req.plan, req.profile)
        return {"explanation": explanation}
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )
