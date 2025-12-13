from typing import Optional, Any, Dict
from datetime import datetime
from pydantic import BaseModel

# --- Report Template Schemas ---

class ReportTemplateBase(BaseModel):
    name: str
    description: Optional[str] = None
    config_json: Dict[str, Any]
    is_public: bool = False

class ReportTemplateCreate(ReportTemplateBase):
    pass

class ReportTemplateUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    config_json: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None

class ReportTemplateRead(ReportTemplateBase):
    id: str
    account_id: str
    created_by_user_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True

# --- Custom Metrics Schemas ---

class CustomMetricBase(BaseModel):
    name: str
    description: Optional[str] = None
    formula: str
    format: str = "number"  # number, currency, percent, time

class CustomMetricCreate(CustomMetricBase):
    pass

class CustomMetricUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    formula: Optional[str] = None
    format: Optional[str] = None

class CustomMetricRead(CustomMetricBase):
    id: str
    account_id: str
    created_by_user_id: Optional[str]
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True
