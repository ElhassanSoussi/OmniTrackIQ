"""
Schemas for scheduled email reports.
"""
from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, field_validator, EmailStr
import re

from app.models.scheduled_report import ReportFrequency, ReportType


class ScheduledReportCreate(BaseModel):
    """Schema for creating a scheduled report."""
    name: str = Field(..., min_length=1, max_length=255)
    report_type: ReportType = ReportType.OVERVIEW
    frequency: ReportFrequency = ReportFrequency.WEEKLY
    recipients: List[str] = Field(..., min_length=1, max_length=10)
    
    # Filters
    date_range_days: str = Field(default="30", pattern=r"^(7|14|30|60|90|custom)$")
    platforms: List[str] = Field(default_factory=list)
    metrics: List[str] = Field(default_factory=list)
    
    # Scheduling
    send_time: str = Field(default="09:00", pattern=r"^\d{2}:\d{2}$")
    timezone: str = Field(default="UTC", max_length=50)
    day_of_week: Optional[str] = Field(
        default=None, 
        pattern=r"^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$"
    )
    day_of_month: Optional[str] = Field(
        default=None, 
        pattern=r"^([1-9]|[12][0-9]|3[01])$"
    )

    @field_validator("recipients")
    @classmethod
    def validate_emails(cls, v: List[str]) -> List[str]:
        email_pattern = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
        for email in v:
            if not email_pattern.match(email):
                raise ValueError(f"Invalid email address: {email}")
        return v
    
    @field_validator("send_time")
    @classmethod
    def validate_time(cls, v: str) -> str:
        parts = v.split(":")
        if len(parts) != 2:
            raise ValueError("Time must be in HH:MM format")
        hour, minute = int(parts[0]), int(parts[1])
        if not (0 <= hour <= 23 and 0 <= minute <= 59):
            raise ValueError("Invalid time value")
        return v


class ScheduledReportUpdate(BaseModel):
    """Schema for updating a scheduled report."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    report_type: Optional[ReportType] = None
    frequency: Optional[ReportFrequency] = None
    recipients: Optional[List[str]] = Field(None, max_length=10)
    
    date_range_days: Optional[str] = Field(None, pattern=r"^(7|14|30|60|90|custom)$")
    platforms: Optional[List[str]] = None
    metrics: Optional[List[str]] = None
    
    is_active: Optional[bool] = None
    send_time: Optional[str] = Field(None, pattern=r"^\d{2}:\d{2}$")
    timezone: Optional[str] = Field(None, max_length=50)
    day_of_week: Optional[str] = Field(
        None, 
        pattern=r"^(monday|tuesday|wednesday|thursday|friday|saturday|sunday)$"
    )
    day_of_month: Optional[str] = Field(
        None, 
        pattern=r"^([1-9]|[12][0-9]|3[01])$"
    )

    @field_validator("recipients")
    @classmethod
    def validate_emails(cls, v: Optional[List[str]]) -> Optional[List[str]]:
        if v is None:
            return v
        email_pattern = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
        for email in v:
            if not email_pattern.match(email):
                raise ValueError(f"Invalid email address: {email}")
        return v


class ScheduledReportResponse(BaseModel):
    """Response schema for a scheduled report."""
    id: str
    name: str
    report_type: ReportType
    frequency: ReportFrequency
    recipients: List[str]
    
    date_range_days: str
    platforms: List[str]
    metrics: List[str]
    
    is_active: bool
    send_time: str
    timezone: str
    day_of_week: Optional[str]
    day_of_month: Optional[str]
    
    last_sent_at: Optional[datetime]
    next_send_at: Optional[datetime]
    send_count: int
    
    created_by: str
    created_at: datetime
    updated_at: Optional[datetime]

    class Config:
        from_attributes = True


class ScheduledReportListResponse(BaseModel):
    """Response schema for list of scheduled reports."""
    items: List[ScheduledReportResponse]
    total: int


class SendTestReportRequest(BaseModel):
    """Request to send a test report immediately."""
    email: str = Field(..., pattern=r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$")
