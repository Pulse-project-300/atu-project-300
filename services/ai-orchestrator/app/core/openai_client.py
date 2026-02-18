"""
OpenAI client for AI-powered text generation and summarization.

This module provides helper functions that use OpenAI's GPT models to generate
human-friendly explanations, summaries, and other text content for workout plans.


Example:
    >>> plan = {"days": [{"day": "Mon", "workout": "Squats"}]}
    >>> summary = await summarize_plan_text(plan)
    >>> print(summary)
    "This workout plan focuses on building strength with a Monday squat session..."
"""

import json

from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY

# Initialize the async OpenAI client with API key from environment configuration
# This client is reused across all function calls for efficiency
client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def summarize_plan_text(plan: dict) -> str:
    """
    Generate a concise, user-friendly summary of a workout plan using GPT-4o-mini.

    This function takes a structured workout plan and uses OpenAI's language model
    to create a natural language summary that explains the plan to users in an
    encouraging, easy-to-understand way.

    Args:
        plan: A dictionary containing the workout plan structure, typically with:
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

    Returns:
        str: A 2-sentence summary of the workout plan in friendly, motivational language.
            Example: "This workout plan targets your major muscle groups with a balanced
            approach. You'll build strength through compound movements like squats and deadlifts."

    Raises:
        openai.APIError: If the OpenAI API request fails
        openai.AuthenticationError: If the API key is invalid or missing

    Note:
        Uses the gpt-4o-mini model for cost efficiency. The model is configured with
        a system prompt to act as a "concise, friendly fitness coach" to ensure
        appropriate tone and brevity in responses.
    """
    # Construct the prompt asking the AI to summarize the workout plan
    content = f"Summarise this workout plan in 2 sentences for a user:\n\n{plan}"

    # Call OpenAI's chat completion API with the fitness coach persona
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",  # mini model for faster, cheaper responses (this model can be changed as needed) 
        messages=[
            # System message sets the AI's personality and behavior
            {"role": "system", "content": "You are a concise, friendly fitness coach."},
            # User message contains the actual task/question
            {"role": "user", "content": content},
        ],
    )

    # Extract the generated text from the response and remove extra whitespace
    return resp.choices[0].message.content.strip()


async def generate_plan(profile: dict, history: list | None = None) -> dict:
    """
    Generate a structured workout plan using GPT-4o-mini.

    Creates a weekly workout plan tailored to the user's profile (goal, experience,
    equipment) and optional workout history.

    Args:
        profile: User profile containing:
            - goal: Fitness goal (e.g., "strength", "hypertrophy", "endurance")
            - experience: Fitness level (e.g., "beginner", "intermediate", "advanced")
            - equipment: Available equipment (optional)
        history: Optional list of past workout logs for context.

    Returns:
        dict: A structured plan with format:
            {
                "version": 1,
                "days": [
                    {"day": "Mon", "workout": [{"name": "Squat", "sets": 3, "reps": 10}]},
                    ...
                ]
            }

    Raises:
        openai.APIError: If the OpenAI API request fails
    """
    history_context = f"\nPast workout history: {history}" if history else ""
    prompt = (
        f"Create a weekly workout plan for this user.\n\n"
        f"User profile: {profile}{history_context}\n\n"
        f"Return ONLY valid JSON with this exact structure, no markdown fences:\n"
        f'{{"version": 1, "days": [{{"day": "Mon", "workout": [{{"name": "Exercise", "sets": 3, "reps": 10}}]}}]}}'
    )

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an experienced fitness coach who builds structured workout plans. "
                    "Always respond with valid JSON only. No markdown, no explanation, just the JSON object."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    )

    raw = resp.choices[0].message.content.strip()
    return json.loads(raw)


async def adapt_plan(
    profile: dict,
    current_plan: dict,
    feedback: str | None = None,
    current_version: int | None = None,
    recent_logs: list | None = None,
) -> dict:
    """
    Adapt an existing workout plan based on user feedback and progress.

    Takes the current plan and modifies it according to user feedback (e.g. fatigue,
    injury, preference changes) and recent workout logs.

    Args:
        profile: User profile with goal, experience, equipment.
        current_plan: The existing workout plan to adapt.
        feedback: Optional free-text feedback (e.g., "too easy", "shoulder injury").
        current_version: Current plan version number for incrementing.
        recent_logs: Optional recent workout logs showing performance.

    Returns:
        dict: An adapted plan with an incremented version number.

    Raises:
        openai.APIError: If the OpenAI API request fails
    """
    next_version = (current_version or 1) + 1
    feedback_context = f"\nUser feedback: {feedback}" if feedback else ""
    logs_context = f"\nRecent workout logs: {recent_logs}" if recent_logs else ""

    prompt = (
        f"Adapt this workout plan based on the user's feedback and progress.\n\n"
        f"User profile: {profile}\n"
        f"Current plan: {current_plan}"
        f"{feedback_context}{logs_context}\n\n"
        f"Return ONLY valid JSON with this exact structure, no markdown fences:\n"
        f'{{"version": {next_version}, "days": [{{"day": "Mon", "workout": [{{"name": "Exercise", "sets": 3, "reps": 10}}]}}]}}'
    )

    resp = await client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "system",
                "content": (
                    "You are an experienced fitness coach who adapts workout plans based on user progress and feedback. "
                    "Progress the plan appropriately — adjust sets, reps, exercises, or intensity. "
                    "Always respond with valid JSON only. No markdown, no explanation, just the JSON object."
                ),
            },
            {"role": "user", "content": prompt},
        ],
    )

    raw = resp.choices[0].message.content.strip()
    return json.loads(raw)


async def explain_plan(plan: dict, profile: dict | None = None) -> str:
    """
    Generate a detailed, personalized explanation of a workout plan using GPT-4o-mini.

    This function analyzes a workout plan and creates a comprehensive explanation that
    helps users understand the purpose, benefits, and rationale behind their training
    program. The explanation is tailored to the user's profile when provided.

    Args:
        plan: A dictionary containing the workout plan structure with:
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
        profile: Optional user profile for personalized explanations, containing:
            - goal: User's fitness goal (e.g., "strength", "hypertrophy", "endurance")
            - experience: Fitness level (e.g., "beginner", "intermediate", "advanced")
            - equipment: Available equipment
            - Any other relevant user context

    Returns:
        str: A detailed explanation (3-5 sentences) covering:
            - The plan's focus and primary training objective
            - How the exercises work together
            - Expected benefits and outcomes
            - Any progressive elements or periodization

        Example: "This plan emphasizes compound movements to build foundational strength
        across all major muscle groups. The Monday squat session targets your lower body,
        while Wednesday's bench press develops upper body pushing strength. Friday's
        deadlifts complete the program by training posterior chain muscles and grip strength.
        Together, these exercises create a balanced program that will improve your overall
        strength and muscle development."

    Raises:
        openai.APIError: If the OpenAI API request fails
        openai.AuthenticationError: If the API key is invalid or missing
        openai.RateLimitError: If quota is exceeded

    Note:
        The explanation is generated with context about the user's profile when available,
        making it more relevant and motivational. Uses GPT-4o-mini for cost efficiency.
    """
    # Build the prompt with or without profile context
    if profile:
        # Include user context for personalized explanation
        context = f"User profile: {profile}\n\n"
        prompt = f"{context}Explain this workout plan in 3-5 sentences, focusing on how it aligns with the user's goals:\n\n{plan}"
    else:
        # Generic explanation without user context
        prompt = f"Explain this workout plan in 3-5 sentences, covering its focus, benefits, and how the exercises work together:\n\n{plan}"

    # Call OpenAI's chat completion API with the fitness coach persona
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",  # Use mini model for faster, cheaper responses
        messages=[
            # System message sets the AI's personality and expertise
            {
                "role": "system",
                "content": "You are an experienced fitness coach who explains workout plans clearly and motivationally. Focus on the 'why' behind the programming."
            },
            # User message contains the plan to explain
            {"role": "user", "content": prompt},
        ],
    )

    # Extract and return the explanation
    return resp.choices[0].message.content.strip()
