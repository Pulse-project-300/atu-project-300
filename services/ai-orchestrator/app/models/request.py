from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional

# Request model for plan generation, adaptation, explanation and chat
class GenerateRequest(BaseModel):
    userId: str = Field(..., description="Pulse user id")
    profile: Dict[str, Any] = Field(..., description="User profile incl. goal, experience, equipment, stats")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Optional baseline workout logs")

class AdaptRequest(BaseModel):
    userId: str = Field(..., description="Pulse user id")
    profile: Dict[str, Any] = Field(..., description="User profile incl. goal, experience, equipment, stats")
    currentPlan: Dict[str, Any] = Field(..., description="Current plan to be adapted")
    currentVersion: Optional[int] = Field(default=None, description="Current plan version")
    recentLogs: List[Dict[str, Any]] = Field(default_factory=list, description="Recent workout logs")
    feedback: Optional[str] = Field(default=None, description="Free-text feedback (fatigue, injury, preference)")

class ExplainRequest(BaseModel):
    plan: Dict[str, Any] = Field(..., description="Workout plan to explain")
    userId: Optional[str] = Field(default=None, description="Optional user id for context")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Optional user profile for personalized explanation")

class ChatMessage(BaseModel):
    role: str = Field(..., description="Message role: 'user' or 'assistant'")
    content: str = Field(..., description="Message content")

class ChatRequest(BaseModel):
    message: str = Field(..., description="User's chat message")
    workoutPlan: Optional[Dict[str, Any]] = Field(default=None, description="Optional current workout plan for context")
    chatHistory: List[ChatMessage] = Field(default_factory=list, description="Previous messages in the conversation")
