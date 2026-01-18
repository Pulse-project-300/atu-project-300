"""
OpenAI client for AI-powered workout plan generation, adaptation, explanation, and chat.

This module provides helper functions that use OpenAI's GPT models to generate
human-friendly workout plans, explanations, summaries, and other text content for workout plans.


"""

from openai import AsyncOpenAI
from app.core.config import OPENAI_API_KEY

client = AsyncOpenAI(api_key=OPENAI_API_KEY)


async def generate_workout_plan(profile: dict, history: list | None = None) -> dict:
    """
    Generate a personalized workout plan using GPT-4o.

    This function creates a complete workout plan tailored to the user's profile,
    goals, experience level, and available equipment. It returns a structured
    workout plan in JSON format.

    Args:
        profile: User profile containing:
            - goal: User's fitness goal (e.g., "build muscle", "lose weight", "get stronger")
            - experience: Fitness level (e.g., "beginner", "intermediate", "advanced")
            - equipment: List of available equipment (e.g., ["full_gym"], ["dumbbells", "resistance_bands"])
            - dob: Date of birth (YYYY-MM-DD format) for age calculation
            - gender: User's gender ("male", "female", "other")
            - height_cm: Height in centimeters
            - weight_kg: Weight in kilograms
        history: Optional list of previous workout logs to inform plan generation

    Returns:
        dict: A structured workout plan with format


    """
    import json
    from datetime import datetime

    # Extract and format profile information for better context
    age = None
    if "dob" in profile and profile["dob"]:
        try:
            birth_date = datetime.strptime(profile["dob"], "%Y-%m-%d")
            today = datetime.today()
            age = today.year - birth_date.year - ((today.month, today.day) < (birth_date.month, birth_date.day))
        except:
            pass

    # Build detailed context about the user
    user_context = []

    # Demographics
    if age:
        user_context.append(f"Age: {age} years old")
    if "gender" in profile and profile["gender"]:
        user_context.append(f"Gender: {profile['gender']}")
    if "height_cm" in profile and profile["height_cm"]:
        user_context.append(f"Height: {profile['height_cm']} cm")
    if "weight_kg" in profile and profile["weight_kg"]:
        user_context.append(f"Weight: {profile['weight_kg']} kg")

    # Fitness profile
    goal = profile.get("goal", "general fitness")
    experience = profile.get("experience", "beginner")
    equipment = profile.get("equipment", [])

    user_context.append(f"Fitness Goal: {goal}")
    user_context.append(f"Experience Level: {experience}")
    user_context.append(f"Available Equipment: {', '.join(equipment) if equipment else 'bodyweight only'}")

    context = "USER PROFILE:\n" + "\n".join(user_context) + "\n\n"

    if history and len(history) > 0:
        context += f"Previous workout history:\n{json.dumps(history, indent=2)}\n\n"

    prompt = f"""{context}Generate a personalized workout plan for this user based on their complete profile.

IMPORTANT EQUIPMENT CONSIDERATIONS:
- full_gym: Use any gym equipment (barbells, machines, cables, etc.)
- home_gym: Use barbells, rack, bench, and plates
- dumbbells: Use only dumbbell exercises
- resistance_bands: Use only resistance band exercises
- bodyweight_only: Use only bodyweight exercises (no equipment)

Return ONLY a valid JSON object with this exact structure (no markdown, no explanations):
{{
  "version": 1,
  "days": [
    {{
      "day": "Mon",
      "workout": [
        {{"name": "Exercise Name", "sets": 3, "reps": 10}}
      ]
    }}
  ]
}}

REQUIREMENTS:
1. Training Frequency:
   - Beginner: 3-4 days per week
   - Intermediate: 4-5 days per week
   - Advanced: 5-6 days per week

2. Use day abbreviations: Mon, Tue, Wed, Thu, Fri, Sat, Sun

3. Exercise Selection:
   - Choose exercises that match the user's available equipment EXACTLY
   - Match difficulty to experience level
   - Consider age and gender for appropriate exercise selection
   - Use the user's body weight and height to suggest appropriate starting weights/difficulty

4. Volume and Intensity (sets x reps):
   - For "strength" or "get stronger" goals: 3-5 sets of 3-6 reps
   - For "hypertrophy" or "build muscle" goals: 3-4 sets of 8-12 reps
   - For "endurance" or "lose weight" goals: 2-3 sets of 12-20 reps
   - Adjust volume based on experience (beginners need less)

5. Programming:
   - Balance muscle groups throughout the week
   - Include compound movements for beginners/intermediates
   - Add accessory work for intermediate/advanced
   - Consider recovery needs based on age

Return ONLY the JSON object, no additional text or markdown."""

    # Call OpenAI's chat completion API
    resp = await client.chat.completions.create(
        model="gpt-4o",  
        messages=[
            {
                "role": "system",
                "content": "You are an expert fitness coach and programming specialist. Generate personalized workout plans in valid JSON format only."
            },
            {"role": "user", "content": prompt},
        ],
        response_format={"type": "json_object"}  
    )

    # Extract and parse the JSON response
    content = resp.choices[0].message.content.strip()

    try:
        plan = json.loads(content)
        return plan
    except json.JSONDecodeError as e:
        raise ValueError(f"Failed to parse OpenAI response as JSON: {e}")


async def explain_plan(plan: dict, profile: dict | None = None) -> str:
    """
    Generate a detailed, personalized explanation of a workout plan using GPT-4o-mini.

    This function analyses a workout plan and creates a comprehensive explanation that
    helps users understand the purpose, benefits, and rationale behind their training
    program. The explanation is tailored to the user's profile when provided.

    Args:
        plan: A dictionary containing the workout plan structure
            
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




async def chat_about_workout(message: str, workout_plan: dict | None = None, chat_history: list | None = None) -> str:
    """
    Chat with the AI about workout plans, fitness advice, and training questions.

    This function provides an interactive chat experience where users can ask
    questions about their workout plans, get fitness advice, or discuss training
    topics with an AI fitness coach.

    Args:
        message: The user's question or message
        workout_plan: Optional current workout plan for context
        chat_history: Optional list of previous messages for conversation continuity
            Format: [{"role": "user" or "assistant", "content": str}, ...]

    Returns:
        str: The AI's response to the user's message

    """
    import json

    # Build the system prompt with workout context if available
    system_prompt = """You are an experienced and friendly fitness coach having a conversation with a client.
Your role is to:
- Answer questions about workout plans, exercises, and training
- Provide practical, science-based fitness advice
- Help users understand their workout programming
- Give tips on form, technique, and progression
- Motivate and encourage users in their fitness journey

Keep responses conversational, clear, and concise (2-4 sentences typically).
Be supportive and positive while maintaining professional expertise."""

    if workout_plan:
        system_prompt += f"\n\nThe user's current workout plan is:\n{json.dumps(workout_plan, indent=2)}\n\nRefer to this plan when relevant to their questions."

    # Build the conversation messages
    messages = [{"role": "system", "content": system_prompt}]

    # Add chat history if available
    if chat_history and len(chat_history) > 0:
        messages.extend(chat_history)

    # Add the current user message
    messages.append({"role": "user", "content": message})

    # Call OpenAI's chat completion API
    resp = await client.chat.completions.create(
        model="gpt-4o-mini",  # Use mini for fast, cost-effective chat
        messages=messages,
        temperature=0.7,  # Slightly creative for natural conversation
    )

    # Extract and return the response
    return resp.choices[0].message.content.strip()
