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
    id: str
    email: str
    account_id: str
    role: str
    name: Optional[str] = None


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
