import os
from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings

JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "1440"))

# auto_error=True will return a clearer 401 response when no token provided
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=True)


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    """
    Create a signed JWT access token.

    :param subject: The subject (usually user ID or email).
    :param expires_minutes: Optional custom expiration in minutes. If None,
                            use JWT_ACCESS_TOKEN_EXPIRE_MINUTES.
    :return: Encoded JWT token as a string.
    """
    if expires_minutes is None:
        expires_minutes = JWT_ACCESS_TOKEN_EXPIRE_MINUTES

    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM,
    )
    return token


class TokenData:
    def __init__(self, sub: str):
        self.sub = sub


def decode_token(token: str) -> Optional[dict]:
    """
    Decode a JWT token without raising exceptions.
    Returns the payload dict or None if invalid/expired.
    
    Use this for optional authentication scenarios.
    """
    if not token:
        return None
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        return payload
    except (jwt.ExpiredSignatureError, jwt.PyJWTError):
        return None


def decode_access_token(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Decode and validate the JWT access token coming from the Authorization header.

    :param token: Raw JWT token from the OAuth2PasswordBearer dependency.
    :return: TokenData with the subject.
    :raises HTTPException: if token is invalid or expired.
    """
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Please log in to continue",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM],
        )
        sub: Optional[str] = payload.get("sub")

        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid session. Please log in again.",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return TokenData(sub=sub)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Your session has expired. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid session. Please log in again.",
            headers={"WWW-Authenticate": "Bearer"},
        )

