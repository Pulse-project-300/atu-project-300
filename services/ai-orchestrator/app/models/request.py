from pydantic import BaseModel, Field
from typing import List, Dict, Any, Optional


class GenerateRequest(BaseModel):
    userId: str = Field(..., description="Pulse user id")
    profile: Dict[str, Any] = Field(..., description="User profile incl. goal, experience, equipment, stats")
    available_exercises: List[Dict[str, Any]] = Field(..., description="Exercises from the library filtered by user equipment")
    history: List[Dict[str, Any]] = Field(default_factory=list, description="Optional baseline workout logs")


class AdaptRequest(BaseModel):
    userId: str = Field(..., description="Pulse user id")
    profile: Dict[str, Any] = Field(..., description="User profile incl. goal, experience, equipment, stats")
    currentRoutine: Dict[str, Any] = Field(..., description="Current routine to be adapted")
    available_exercises: List[Dict[str, Any]] = Field(..., description="Exercises from the library filtered by user equipment")
    recentLogs: List[Dict[str, Any]] = Field(default_factory=list, description="Recent workout logs")
    feedback: Optional[str] = Field(default=None, max_length=500, description="Free-text feedback (fatigue, injury, preference)")


class ExplainRequest(BaseModel):
    routine: Dict[str, Any] = Field(..., description="Workout routine to explain")
    userId: Optional[str] = Field(default=None, description="Optional user id for context")
    profile: Optional[Dict[str, Any]] = Field(default=None, description="Optional user profile for personalized explanation")
