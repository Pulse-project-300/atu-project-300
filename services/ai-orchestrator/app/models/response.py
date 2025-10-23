from pydantic import BaseModel, Field
from typing import Dict, Any

# Response model for plan generation/adaptation
class PlanResponse(BaseModel):
    userId: str
    plan: Dict[str, Any] = Field(..., description="Structured plan JSON")
    version: int = Field(..., description="Plan version (increments on adapt)")

# Response model for AI chat explanation
class ExplainResponse(BaseModel):
    explanation: str
