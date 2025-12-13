import re
from typing import Optional

from pydantic import BaseModel, validator

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


class SignupRequest(BaseModel):
    email: str
    password: str
    account_name: str

    @validator("email")
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email address")
        return email

    @validator("account_name")
    def validate_account_name(cls, v: str) -> str:
        name = v.strip()
        if not name:
            raise ValueError("Account name is required")
        return name

    @validator("password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class LoginRequest(BaseModel):
    email: str
    password: str

    @validator("email")
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email address")
        return email


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserInfo(BaseModel):
    """User profile information returned by /auth/me"""
    id: str
    email: str
    account_id: str
    role: str
    name: Optional[str] = None
    account_name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None


class ForgotPasswordRequest(BaseModel):
    email: str

    @validator("email")
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email address")
        return email


class ResetPasswordRequest(BaseModel):
    token: str
    new_password: str

    @validator("new_password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v


class MessageResponse(BaseModel):
    message: str


# ================== Profile Update Schemas ==================

class UpdateUserProfileRequest(BaseModel):
    """Update user profile settings"""
    name: Optional[str] = None
    avatar_url: Optional[str] = None
    timezone: Optional[str] = None

    @validator("name")
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) > 100:
                raise ValueError("Display name must be 100 characters or less")
        return v


class UpdateOrganizationRequest(BaseModel):
    """Update organization settings"""
    name: Optional[str] = None  # Workspace name
    industry: Optional[str] = None
    currency: Optional[str] = None
    timezone: Optional[str] = None

    @validator("name")
    def validate_name(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            if len(v) < 1:
                raise ValueError("Workspace name cannot be empty")
            if len(v) > 100:
                raise ValueError("Workspace name must be 100 characters or less")
        return v

    @validator("currency")
    def validate_currency(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip().upper()
            if len(v) != 3:
                raise ValueError("Currency must be a 3-letter code (e.g. USD)")
        return v


# Deprecated but kept for backward compatibility if needed, though we will switch to above
class UpdateAccountRequest(BaseModel):
    """Legacy update request - mixes profile and account"""
    account_name: Optional[str] = None
    name: Optional[str] = None


class UpdateEmailRequest(BaseModel):
    """Update user email address"""
    email: str

    @validator("email")
    def normalize_email(cls, v: str) -> str:
        email = v.strip().lower()
        if not EMAIL_REGEX.match(email):
            raise ValueError("Invalid email address")
        return email


class UpdatePasswordRequest(BaseModel):
    """Update user password"""
    current_password: str
    new_password: str

    @validator("new_password")
    def validate_password(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return v

