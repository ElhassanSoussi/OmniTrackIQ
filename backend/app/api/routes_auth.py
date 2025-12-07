from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db
from app.models.user import User
from app.schemas.auth import LoginRequest, SignupRequest, TokenResponse, UserInfo
from app.services import auth_service

router = APIRouter()


@router.post("/signup", response_model=TokenResponse)
def signup(body: SignupRequest, db: Session = Depends(get_db)):
    token = auth_service.signup(db, body.email, body.password, body.account_name)
    return TokenResponse(access_token=token)


@router.post("/login", response_model=TokenResponse)
def login(body: LoginRequest, db: Session = Depends(get_db)):
    token = auth_service.login(db, body.email, body.password)
    return TokenResponse(access_token=token)


@router.get("/me", response_model=UserInfo)
def me(current_user: User = Depends(get_current_user)):
    return UserInfo(id=current_user.id, email=current_user.email, account_id=current_user.account_id)
