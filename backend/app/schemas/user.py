"""
Pydantic schemas for user-related operations.
"""

from typing import Optional
from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Base user schema with common fields."""
    email: EmailStr


class UserCreate(UserBase):
    """Schema for creating a new user."""
    password: str
    account_name: Optional[str] = None


class UserUpdate(BaseModel):
    """Schema for updating user profile."""
    email: Optional[EmailStr] = None
    password: Optional[str] = None


class UserResponse(UserBase):
    """Schema for user response (public info)."""
    id: str
    account_id: Optional[str] = None
    is_active: bool = True

    class Config:
        from_attributes = True


class UserProfile(UserBase):
    """Extended user profile with account info."""
    id: str
    account_id: Optional[str] = None
    account_name: Optional[str] = None
    role: Optional[str] = None
    created_at: Optional[str] = None

    class Config:
        from_attributes = True
