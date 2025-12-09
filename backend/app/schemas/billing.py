from typing import List, Optional, Literal
from pydantic import BaseModel


# Plan type literals
PlanType = Literal["free", "starter", "pro", "agency", "enterprise"]
SubscriptionStatusType = Literal["active", "trialing", "past_due", "canceled", "incomplete", "incomplete_expired", "none"]


class CheckoutRequest(BaseModel):
    plan: str  # starter | pro | agency | enterprise


class CheckoutResponse(BaseModel):
    url: str


class PortalResponse(BaseModel):
    url: str


class PlanInfo(BaseModel):
    id: str
    name: str
    price: int
    price_id: str
    features: List[str]


class PlansResponse(BaseModel):
    plans: List[dict]


class BillingInfoResponse(BaseModel):
    """Legacy billing info response for backward compatibility."""
    plan: Optional[str]
    plan_name: str
    status: str
    renewal: Optional[str]
    features: List[str]
    can_upgrade: bool
    can_cancel: bool


class BillingStatusResponse(BaseModel):
    """
    Comprehensive billing status response.
    Used by the frontend to display current plan information.
    """
    plan: PlanType = "free"
    status: SubscriptionStatusType = "none"
    current_period_start: Optional[str] = None
    current_period_end: Optional[str] = None
    trial_end: Optional[str] = None
    stripe_customer_portal_available: bool = False
    features: List[str] = []
    can_upgrade: bool = True
    can_cancel: bool = False
    billing_configured: bool = True  # False if Stripe is not set up
