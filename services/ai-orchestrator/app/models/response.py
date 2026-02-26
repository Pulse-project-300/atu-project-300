from pydantic import BaseModel, Field
from typing import Dict, Any


class RoutineResponse(BaseModel):
    userId: str
    routine: Dict[str, Any] = Field(..., description="Structured routine JSON")


class ExplainResponse(BaseModel):
    explanation: str
