"""
Pydantic schemas for AdAccount (DataSource) endpoints.
"""
from datetime import datetime
from typing import Optional, List
from enum import Enum

from pydantic import BaseModel, Field


class AdAccountStatusEnum(str, Enum):
    """Status values for ad accounts."""
    ACTIVE = "active"
    PAUSED = "paused"
    DISCONNECTED = "disconnected"
    ERROR = "error"


class AdAccountBase(BaseModel):
    """Base schema for ad account data."""
    name: str = Field(..., description="Display name for the ad account")
    platform: str = Field(..., description="Platform type: facebook, google_ads, tiktok, etc.")
    external_id: str = Field(..., description="Platform's account ID")
    external_name: Optional[str] = Field(None, description="Platform's account name")
    currency: str = Field("USD", description="Currency code for this account")
    timezone: Optional[str] = Field(None, description="Timezone from platform")


class AdAccountCreate(AdAccountBase):
    """Schema for creating a new ad account."""
    integration_id: Optional[str] = Field(None, description="Parent integration ID")


class AdAccountUpdate(BaseModel):
    """Schema for updating an ad account."""
    name: Optional[str] = None
    status: Optional[AdAccountStatusEnum] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None


class AdAccountResponse(AdAccountBase):
    """Schema for ad account API responses."""
    id: str
    account_id: str
    integration_id: Optional[str] = None
    status: AdAccountStatusEnum
    last_synced_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True


class AdAccountListResponse(BaseModel):
    """Response for listing ad accounts."""
    ad_accounts: List[AdAccountResponse]
    total: int


class AdAccountSummary(BaseModel):
    """Summary metrics for an ad account."""
    id: str
    name: str
    platform: str
    status: AdAccountStatusEnum
    spend_30d: float = Field(0, description="Total spend in last 30 days")
    revenue_30d: float = Field(0, description="Attributed revenue in last 30 days")
    roas_30d: float = Field(0, description="ROAS in last 30 days")
    last_synced_at: Optional[datetime] = None
