from pydantic import BaseModel


class CheckoutRequest(BaseModel):
    plan: str  # starter | pro | agency


class CheckoutResponse(BaseModel):
    url: str
