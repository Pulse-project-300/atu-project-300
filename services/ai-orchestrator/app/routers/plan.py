from fastapi import APIRouter, HTTPException
from app.models.request import GenerateRequest, ExplainRequest, ChatRequest
from app.core.openai_client import explain_plan, generate_workout_plan, chat_about_workout

router = APIRouter(tags=["plan"])

@router.post("/generate")
async def generate_plan(req: GenerateRequest):
    """
    Generate a personalized AI-powered workout plan.

    Uses OpenAI's GPT-4o model to create a customised workout plan based on
    the user's profile, goals, experience level, and available equipment.

    Args:
        req: GenerateRequest containing userId, profile, and optional history

    Returns:
        Dict with the generated plan and userId

    """
    try:
        # Call OpenAI to generate the workout plan
        plan = await generate_workout_plan(req.profile, req.history)
        return {"plan": plan, "userId": req.userId}
    except Exception as e:
        # Handle API errors gracefully
        raise HTTPException(
            status_code=500,
            detail=f"Failed to generate workout plan: {str(e)}"
        )

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

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Chat with the AI about workout plans and fitness topics.

    Provides an interactive conversational experience where users can ask
    questions, get advice, and discuss their training with an AI fitness coach.

    Args:
        req: ChatRequest containing the message, optional workout plan, and chat history

    Returns:
        Dict with the AI's response message

    """
    try:
        # Convert chat history to the format expected by OpenAI
        chat_history = [{"role": msg.role, "content": msg.content} for msg in req.chatHistory]

        # Call OpenAI to get the chat response
        response = await chat_about_workout(
            message=req.message,
            workout_plan=req.workoutPlan,
            chat_history=chat_history
        )
        return {"response": response}
    except Exception as e:
        # Handle API errors gracefully
        raise HTTPException(
            status_code=500,
            detail=f"Failed to get chat response: {str(e)}"
        ) 