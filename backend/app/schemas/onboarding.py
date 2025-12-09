"""
Schemas for onboarding flow.
"""
from typing import Literal
from pydantic import BaseModel


class OnboardingSteps(BaseModel):
    """Individual onboarding step statuses."""
    created_workspace: bool = False
    connected_integration: bool = False
    viewed_dashboard: bool = False


class OnboardingStatusResponse(BaseModel):
    """Response schema for onboarding status."""
    onboarding_completed: bool
    steps: OnboardingSteps

    class Config:
        from_attributes = True


class CompleteStepRequest(BaseModel):
    """Request to complete an onboarding step."""
    step: Literal["created_workspace", "connected_integration", "viewed_dashboard"]


class OnboardingResetResponse(BaseModel):
    """Response after resetting onboarding."""
    message: str
    onboarding_completed: bool
    steps: OnboardingSteps
