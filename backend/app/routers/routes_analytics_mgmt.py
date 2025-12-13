from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.schemas.analytics_mgmt import (
    ReportTemplateCreate, ReportTemplateRead, ReportTemplateUpdate,
    CustomMetricCreate, CustomMetricRead, CustomMetricUpdate
)
from app.services import analytics_mgmt_service

router = APIRouter()

# --- Report Templates ---

@router.post("/templates", response_model=ReportTemplateRead, tags=["Analytics Management"])
def create_template(
    template_in: ReportTemplateCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Create a new report template."""
    return analytics_mgmt_service.create_report_template(db, template_in, user.account_id, user.id)

@router.get("/templates", response_model=List[ReportTemplateRead], tags=["Analytics Management"])
def list_templates(
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """List all report templates for the account."""
    return analytics_mgmt_service.get_report_templates(db, user.account_id)

@router.delete("/templates/{template_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Analytics Management"])
def delete_template(
    template_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Delete a report template."""
    analytics_mgmt_service.delete_report_template(db, template_id, user.account_id)
    return None

# --- Custom Metrics ---

@router.post("/custom-metrics", response_model=CustomMetricRead, tags=["Analytics Management"])
def create_custom_metric(
    metric_in: CustomMetricCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Create a new custom metric."""
    return analytics_mgmt_service.create_custom_metric(db, metric_in, user.account_id, user.id)

@router.get("/custom-metrics", response_model=List[CustomMetricRead], tags=["Analytics Management"])
def list_custom_metrics(
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """List all custom metrics for the account."""
    return analytics_mgmt_service.get_custom_metrics(db, user.account_id)

@router.delete("/custom-metrics/{metric_id}", status_code=status.HTTP_204_NO_CONTENT, tags=["Analytics Management"])
def delete_custom_metric(
    metric_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Delete a custom metric."""
    analytics_mgmt_service.delete_custom_metric(db, metric_id, user.account_id)
    return None
