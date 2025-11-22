"""
OpenAI client for AI-powered text generation and summarization.

This module provides helper functions that use OpenAI's GPT models to generate
human-friendly explanations, summaries, and other text content for workout plans.

Quick Start:
    1. Get an API key from https://platform.openai.com/api-keys
    2. Set the environment variable:
        export OPENAI_API_KEY="sk-proj-your-key-here"
    3. Or add to .env file:
        echo "OPENAI_API_KEY=sk-proj-your-key-here" > .env
    4. The client will automatically connect using the API key from config

Example:
    >>> plan = {"days": [{"day": "Mon", "workout": "Squats"}]}
    >>> summary = await summarize_plan_text(plan)
    >>> print(summary)
    "This workout plan focuses on building strength with a Monday squat session..."
"""

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
        model="gpt-4o-mini",  # Use mini model for faster, cheaper responses
        messages=[
            # System message sets the AI's personality and behavior
            {"role": "system", "content": "You are a concise, friendly fitness coach."},
            # User message contains the actual task/question
            {"role": "user", "content": content},
        ],
    )

    # Extract the generated text from the response and remove extra whitespace
    return resp.choices[0].message.content.strip()
