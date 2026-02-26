from fastapi import APIRouter, Depends, HTTPException
from app.models.request import GenerateRequest, AdaptRequest, ExplainRequest
from app.core.openai_client import generate_routine, adapt_routine, explain_routine
from app.core.rate_limiter import require_rate_limit

router = APIRouter(tags=["routine"])


@router.post("/generate", dependencies=[Depends(require_rate_limit)])
async def generate_routine_endpoint(req: GenerateRequest):
    """
    Generate a new AI-powered workout routine.

    Uses OpenAI's GPT model to create a structured, personalised workout routine
    using only exercises from the provided exercise library.
    """
    try:
        routine = await generate_routine(
            profile=req.profile,
            available_exercises=req.available_exercises,
            history=req.history or [],
        )
        return {"routine": routine, "userId": req.userId}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate routine: {str(e)}"
        )


@router.post("/adapt", dependencies=[Depends(require_rate_limit)])
async def adapt_routine_endpoint(req: AdaptRequest):
    """
    Adapt an existing workout routine based on user feedback and progress.

    Uses OpenAI's GPT model to intelligently modify the current routine
    using only exercises from the provided exercise library.
    """
    try:
        routine = await adapt_routine(
            profile=req.profile,
            current_routine=req.currentRoutine,
            available_exercises=req.available_exercises,
            feedback=req.feedback,
            recent_logs=req.recentLogs or [],
        )
        return {"routine": routine, "userId": req.userId}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to adapt routine: {str(e)}"
        )


@router.post("/explain", dependencies=[Depends(require_rate_limit)])
async def explain_routine_endpoint(req: ExplainRequest):
    """
    Generate an AI-powered explanation of a workout routine.
    """
    try:
        explanation = await explain_routine(req.routine, req.profile)
        return {"explanation": explanation}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate explanation: {str(e)}"
        )
