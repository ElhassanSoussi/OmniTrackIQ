"""
Routes for generating and managing sample/demo data.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.user import User
from app.services import sample_data_service


router = APIRouter()


class SampleDataResponse(BaseModel):
    message: str
    ad_spend_records: int = 0
    order_records: int = 0


class SampleDataStatsResponse(BaseModel):
    has_sample_data: bool
    ad_spend_records: int
    order_records: int


@router.get("/stats", response_model=SampleDataStatsResponse)
def get_sample_data_stats(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_account_user),
):
    """Get statistics about sample data in the account."""
    return sample_data_service.get_sample_data_stats(db, user.account_id)


@router.post("/generate", response_model=SampleDataResponse)
def generate_sample_data(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_account_user),
):
    """
    Generate sample ad spend and order data for demo purposes.
    Useful for new accounts to explore the platform.
    """
    # Check if already has sample data
    if sample_data_service.has_sample_data(db, user.account_id):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Sample data already exists. Delete existing sample data first.",
        )
    
    # Generate sample data
    ad_spend_count = sample_data_service.generate_sample_ad_spend(
        db, user.account_id, days=30
    )
    orders_count = sample_data_service.generate_sample_orders(
        db, user.account_id, days=30, orders_per_day=15
    )
    
    return SampleDataResponse(
        message="Sample data generated successfully",
        ad_spend_records=ad_spend_count,
        order_records=orders_count,
    )


@router.delete("/", response_model=SampleDataResponse)
def delete_sample_data(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_account_user),
):
    """Delete all sample/demo data from the account."""
    result = sample_data_service.delete_sample_data(db, user.account_id)
    
    return SampleDataResponse(
        message="Sample data deleted successfully",
        ad_spend_records=result["ad_spend_deleted"],
        order_records=result["orders_deleted"],
    )
