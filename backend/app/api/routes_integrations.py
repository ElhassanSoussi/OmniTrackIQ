from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, get_db

router = APIRouter()


@router.get("/")
def list_integrations(db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Placeholder: will return integration records in V1 ingest phase
    return []


@router.get("/{platform}/connect-url")
def connect_url(platform: str, user=Depends(get_current_user)):
    # Placeholder for OAuth URL construction per platform
    return {"url": f"https://connect/{platform}"}


@router.delete("/{platform}")
def disconnect(platform: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    # Placeholder disconnect implementation
    return {"status": "disconnected", "platform": platform}
