from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.account import Account
from app.models.user import User
from app.security.jwt import create_access_token
from app.security.password import hash_password, verify_password


def signup(db: Session, email: str, password: str, account_name: str) -> str:
    existing = db.query(User).filter(User.email == email).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered",
        )

    account = Account(name=account_name, type="business")
    db.add(account)
    db.flush()

    user = User(email=email, password_hash=hash_password(password), account_id=account.id)
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(user.id)
    return token


def login(db: Session, email: str, password: str) -> str:
    user = db.query(User).filter(User.email == email).first()
    if not user or not verify_password(password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")
    return create_access_token(user.id)
