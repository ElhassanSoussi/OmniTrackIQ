"""
Onboarding endpoints for tracking and managing workspace setup progress.
All endpoints are scoped to the authenticated user's current workspace.
"""
import logging
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.models.user import User
from app.models.account import Account, DEFAULT_ONBOARDING_STEPS
from app.routers.deps import get_current_account_user, get_db
from app.schemas.onboarding import (
    OnboardingStatusResponse,
    OnboardingSteps,
    CompleteStepRequest,
    OnboardingResetResponse,
)

logger = logging.getLogger(__name__)
router = APIRouter()


def get_account_for_user(db: Session, user: User) -> Account:
    """Get the account for the authenticated user."""
    account = db.query(Account).filter(Account.id == user.account_id).first()
    if not account:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Workspace not found"
        )
    return account


def check_all_steps_completed(steps: dict) -> bool:
    """Check if all required onboarding steps are completed."""
    required_steps = ["created_workspace", "connected_integration", "viewed_dashboard"]
    return all(steps.get(step, False) for step in required_steps)


@router.get("/status", response_model=OnboardingStatusResponse)
def get_onboarding_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_account_user)
):
    """
    Get the onboarding status for the authenticated user's current workspace.
    Returns onboarding completion status and individual step progress.
    """
    account = get_account_for_user(db, current_user)
    
    # Ensure onboarding_steps has all required keys
    steps = account.onboarding_steps or {}
    normalized_steps = {
        "created_workspace": steps.get("created_workspace", False),
        "connected_integration": steps.get("connected_integration", False),
        "viewed_dashboard": steps.get("viewed_dashboard", False),
    }
    
    return OnboardingStatusResponse(
        onboarding_completed=account.onboarding_completed,
        steps=OnboardingSteps(**normalized_steps)
    )


@router.post("/complete-step", response_model=OnboardingStatusResponse)
def complete_onboarding_step(
    body: CompleteStepRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_account_user)
):
    """
    Mark an onboarding step as completed for the current workspace.
    If all critical steps are done, automatically sets onboarding_completed to True.
    """
    account = get_account_for_user(db, current_user)
    
    # Get current steps or initialize
    steps = account.onboarding_steps or DEFAULT_ONBOARDING_STEPS.copy()
    
    # Mark the step as completed
    if body.step in steps:
        steps[body.step] = True
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid onboarding step: {body.step}"
        )
    
    # Update the account
    account.onboarding_steps = steps
    
    # Check if all steps are completed
    if check_all_steps_completed(steps):
        account.onboarding_completed = True
        logger.info(f"Onboarding completed for account {account.id}")
    
    db.commit()
    db.refresh(account)
    
    normalized_steps = {
        "created_workspace": steps.get("created_workspace", False),
        "connected_integration": steps.get("connected_integration", False),
        "viewed_dashboard": steps.get("viewed_dashboard", False),
    }
    
    return OnboardingStatusResponse(
        onboarding_completed=account.onboarding_completed,
        steps=OnboardingSteps(**normalized_steps)
    )


@router.post("/reset", response_model=OnboardingResetResponse)
def reset_onboarding(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_account_user)
):
    """
    Reset onboarding for the current workspace.
    Intended for development/testing purposes.
    """
    account = get_account_for_user(db, current_user)
    
    # Reset to defaults
    account.onboarding_completed = False
    account.onboarding_steps = DEFAULT_ONBOARDING_STEPS.copy()
    
    db.commit()
    db.refresh(account)
    
    logger.info(f"Onboarding reset for account {account.id}")
    
    return OnboardingResetResponse(
        message="Onboarding has been reset",
        onboarding_completed=False,
        steps=OnboardingSteps(**DEFAULT_ONBOARDING_STEPS)
    )
