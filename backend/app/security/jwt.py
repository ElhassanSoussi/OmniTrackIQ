from datetime import datetime, timedelta, timezone
from typing import Any, Optional

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer

from app.config import settings

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")


def create_access_token(subject: str, expires_minutes: Optional[int] = None) -> str:
    """
    Create a signed JWT access token.

    :param subject: The subject (usually user ID or email).
    :param expires_minutes: Optional custom expiration in minutes. If None,
                            use settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES.
    :return: Encoded JWT token as a string.
    """
    if expires_minutes is None:
        expires_minutes = settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES

    expire = datetime.now(timezone.utc) + timedelta(minutes=expires_minutes)
    payload: dict[str, Any] = {"sub": subject, "exp": expire}
    token = jwt.encode(
        payload,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return token


class TokenData:
    def __init__(self, sub: str):
        self.sub = sub


def decode_access_token(token: str = Depends(oauth2_scheme)) -> TokenData:
    """
    Decode and validate the JWT access token coming from the Authorization header.

    :param token: Raw JWT token from the OAuth2PasswordBearer dependency.
    :return: TokenData with the subject.
    :raises HTTPException: if token is invalid or expired.
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM],
        )
        sub: Optional[str] = payload.get("sub")

        if sub is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        return TokenData(sub=sub)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
        )
    except jwt.PyJWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token",
        )

