"""
API routes for the "Ask Your Data" chatbot feature.
"""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.chat import ChatRequest, ChatResponse, ChatSuggestion
from app.services.chat_service import process_chat_message

router = APIRouter()


@router.post("/message", response_model=ChatResponse)
def send_message(
    request: ChatRequest,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """
    Send a message to the chatbot and get a response.
    
    The chatbot can answer questions about:
    - Your metrics (revenue, ROAS, spend, orders)
    - Platform integrations and setup
    - Features and how to use them
    - Billing and subscription info
    
    Include conversation_id from previous responses to maintain context.
    """
    result = process_chat_message(
        db=db,
        account_id=user.account_id,
        message=request.message,
        conversation_id=request.conversation_id,
    )
    
    return ChatResponse(
        message=result["message"],
        conversation_id=result["conversation_id"],
        response_type=result["response_type"],
        metrics=result.get("metrics"),
        suggestions=result.get("suggestions"),
    )


@router.get("/suggestions", response_model=list[ChatSuggestion])
def get_suggestions(
    user=Depends(get_current_account_user),
):
    """
    Get suggested questions for the chatbot.
    
    These can be shown as quick-action buttons in the chat UI.
    """
    return [
        ChatSuggestion(text="What's my revenue this week?", category="metrics"),
        ChatSuggestion(text="Show me my ROAS", category="metrics"),
        ChatSuggestion(text="How is my performance today?", category="metrics"),
        ChatSuggestion(text="How do I connect Shopify?", category="help"),
        ChatSuggestion(text="What attribution models do you support?", category="feature"),
        ChatSuggestion(text="What is cohort analysis?", category="feature"),
        ChatSuggestion(text="What are your pricing plans?", category="help"),
        ChatSuggestion(text="How do I contact support?", category="help"),
    ]
