from typing import Generator

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.db import SessionLocal
from app.models.user import User
from app.security.jwt import TokenData, decode_access_token


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def get_current_user(
    token_data: TokenData = Depends(decode_access_token),
    db: Session = Depends(get_db),
) -> User:
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Your account was not found. Please sign up or contact support."
        )
    return user


def get_current_account_user(
    token_data: TokenData = Depends(decode_access_token),
    db: Session = Depends(get_db),
) -> User:
    """
    Resolve the authenticated user and ensure they belong to an account.
    Use this when downstream queries require account scoping.
    """
    user = db.query(User).filter(User.id == token_data.sub).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, 
            detail="Your account was not found. Please sign up or contact support."
        )
    if not user.account_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Your account setup is incomplete. Please contact support."
        )
    return user


def get_current_account_id(user: User = Depends(get_current_account_user)) -> str:
    return user.account_id
