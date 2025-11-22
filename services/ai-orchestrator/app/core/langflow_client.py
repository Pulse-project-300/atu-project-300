"""
Langflow client for AI-powered workout plan generation and adaptation.

This module provides an interface to Langflow workflows that use AI models
to generate personalized workout plans and adapt them based on user progress.
"""

from typing import Dict, Any, List
import httpx
from app.core.config import (
    LANGFLOW_BASE_URL,
    LANGFLOW_GENERATE_FLOW_ID,
    LANGFLOW_ADAPT_FLOW_ID,
)

# TODO: wire up these functions

async def run_flow_generate(profile: Dict[str, Any], history: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Generate a new workout plan using Langflow's AI workflow.

    This function calls the Langflow generate flow which uses AI models to create
    a personalized workout plan based on the user's profile and workout history.

    Args:
        profile: User profile data including fitness level, goals, equipment, etc.
        history: List of previous workout sessions and their outcomes

    Returns:
        Dict containing the generated workout plan with structure:
        {
            "days": [
                {
                    "day": str,  # e.g., "Mon", "Wed", "Fri"
                    "workout": [
                        {"name": str, "sets": int, "reps": int},
                        ...
                    ]
                },
                ...
            ]
        }

    Raises:
        httpx.HTTPStatusError: If the Langflow API request fails
    """
    # Fallback plan when Langflow is not configured
    if not LANGFLOW_GENERATE_FLOW_ID:
        # Return a basic 3-day strength training template as placeholder
        # TODO: Remove this fallback once Langflow integration is complete
        return {
            "days": [
                {"day": "Mon", "workout": [{"name": "Squat", "sets": 3, "reps": 10}]},
                {"day": "Wed", "workout": [{"name": "Bench", "sets": 3, "reps": 10}]},
                {"day": "Fri", "workout": [{"name": "Deadlift", "sets": 3, "reps": 5}]},
            ]
        }

    # Call Langflow API to generate the workout plan
    async with httpx.AsyncClient(timeout=60) as client:
        # POST to the specific Langflow flow endpoint with user data
        resp = await client.post(
            f"{LANGFLOW_BASE_URL}/api/v1/run/{LANGFLOW_GENERATE_FLOW_ID}",
            json={"inputs": {"profile": profile, "history": history}},
        )
        resp.raise_for_status()  # Raise exception on HTTP errors (4xx, 5xx)
        data = resp.json()
        return _extract_plan(data)  # Extract plan from Langflow response format

async def run_flow_adapt(
    profile: Dict[str, Any],
    recent_logs: List[Dict[str, Any]],
    current_plan: Dict[str, Any],
    feedback: str | None,
) -> Dict[str, Any]:
    """
    Adapt an existing workout plan using Langflow's AI workflow.

    This function calls the Langflow adapt flow which analyzes recent workout logs,
    user feedback, and the current plan to make intelligent adjustments. This enables
    progressive overload, injury prevention, and personalized plan refinement.

    Args:
        profile: User profile data including fitness level, goals, constraints
        recent_logs: List of recent workout logs showing completed exercises and performance
        current_plan: The current active workout plan to be adapted
        feedback: Optional user feedback about the plan (e.g., "too hard", "knee pain")

    Returns:
        Dict containing the adapted workout plan with the same structure as run_flow_generate

    Raises:
        httpx.HTTPStatusError: If the Langflow API request fails
    """
    # Fallback adaptation when Langflow is not configured
    if not LANGFLOW_ADAPT_FLOW_ID:
        # Simple progressive overload: increment reps by 1 for all exercises
        # TODO: Test with more sophisticated progressive overload strategies
        out = dict(current_plan)
        try:
            # Iterate through each day and workout in the plan
            for d in out.get("days", []):
                for w in d.get("workout", []):
                    # Only increment if reps is an integer (not a range like "8-10")
                    if isinstance(w.get("reps"), int):
                        w["reps"] = w["reps"] + 1
        except Exception:
            # Silently fail if plan structure is unexpected, return original plan
            pass
        return out

    # Call Langflow API to adapt the workout plan
    async with httpx.AsyncClient(timeout=60) as client:
        # POST to the adaptation flow with all context needed for intelligent adjustments
        resp = await client.post(
            f"{LANGFLOW_BASE_URL}/api/v1/run/{LANGFLOW_ADAPT_FLOW_ID}",
            json={
                "inputs": {
                    "profile": profile,
                    "recent_logs": recent_logs,
                    "current_plan": current_plan,
                    "feedback": feedback or "",  # Default to empty string if no feedback
                }
            },
        )
        resp.raise_for_status()  # Raise exception on HTTP errors
        data = resp.json()
        return _extract_plan(data)  # Extract adapted plan from Langflow response

def _extract_plan(data: dict) -> dict:
    """
    Extract the workout plan from Langflow's response format.

    Langflow responses may wrap the actual plan data in different formats depending
    on the flow configuration. This function normalizes the response to always return
    the plan object directly.

    Args:
        data: The raw JSON response from Langflow API

    Returns:
        The extracted workout plan dict. If the response has a top-level "plan" key,
        returns that value. Otherwise, assumes the entire response is the plan.
    """
    # Check if plan is nested under a "plan" key
    if "plan" in data:
        return data["plan"]

    # Otherwise, the entire response is the plan
    return data
