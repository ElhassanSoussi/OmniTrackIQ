"""
Pydantic schemas for the chat/chatbot feature.
"""
from datetime import datetime
from typing import Optional, List, Literal
from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single message in the chat."""
    role: Literal["user", "assistant", "system"]
    content: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatRequest(BaseModel):
    """Request schema for chat endpoint."""
    message: str = Field(..., min_length=1, max_length=1000, description="The user's message")
    conversation_id: Optional[str] = Field(None, description="Optional conversation ID for context")
    context: Optional[str] = Field(None, description="Optional context about what page/feature the user is on")


class MetricValue(BaseModel):
    """A metric value returned in chat responses."""
    name: str
    value: str
    change: Optional[str] = None
    change_direction: Optional[Literal["up", "down", "neutral"]] = None


class ChatResponse(BaseModel):
    """Response schema for chat endpoint."""
    message: str = Field(..., description="The assistant's response")
    conversation_id: str = Field(..., description="Conversation ID for follow-up questions")
    response_type: Literal["metrics", "faq", "help", "general"] = Field(
        default="general", 
        description="Type of response to help frontend render appropriately"
    )
    metrics: Optional[List[MetricValue]] = Field(None, description="Metrics data if the query was about metrics")
    suggestions: Optional[List[str]] = Field(None, description="Suggested follow-up questions")
    sources: Optional[List[str]] = Field(None, description="Sources or links for the information")


class ChatSuggestion(BaseModel):
    """A suggested question for the chat."""
    text: str
    category: Literal["metrics", "help", "feature"]
