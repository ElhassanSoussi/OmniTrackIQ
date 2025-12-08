from typing import List, Optional
from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    plan: str  # starter | pro | agency


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
    plan: Optional[str]
    plan_name: str
    status: str
    renewal: Optional[str]
    features: List[str]
    can_upgrade: bool
    can_cancel: bool
