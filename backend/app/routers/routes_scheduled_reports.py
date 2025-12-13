"""Scheduled reports CRUD endpoints."""
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status, Query, BackgroundTasks
from sqlalchemy.orm import Session

from app.config import settings

from app.routers.deps import get_current_account_user, get_db
from app.models.scheduled_report import ReportFrequency, ReportType
from app.schemas.scheduled_report import (
    ScheduledReportCreate,
    ScheduledReportUpdate,
    ScheduledReportResponse,
    ScheduledReportListResponse,
    SendTestReportRequest,
)
from app.services.scheduled_report_service import (
    get_scheduled_reports,
    get_scheduled_report,
    create_scheduled_report,
    update_scheduled_report,
    delete_scheduled_report,
    report_to_response,
)

router = APIRouter()


@router.get("", response_model=ScheduledReportListResponse)
def list_scheduled_reports(
    is_active: Optional[bool] = Query(None, description="Filter by active status"),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """List all scheduled reports for the current account."""
    total, items = get_scheduled_reports(
        db,
        account_id=user.account_id,
        is_active=is_active,
        limit=limit,
        offset=offset,
    )
    
    return {
        "items": [report_to_response(r) for r in items],
        "total": total,
    }


@router.get("/{report_id}", response_model=ScheduledReportResponse)
def get_single_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get a specific scheduled report."""
    report = get_scheduled_report(db, report_id=report_id, account_id=user.account_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report not found",
        )
    return report_to_response(report)


@router.post("", response_model=ScheduledReportResponse, status_code=status.HTTP_201_CREATED)
def create_new_report(
    data: ScheduledReportCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Create a new scheduled report."""
    report = create_scheduled_report(
        db,
        account_id=user.account_id,
        user_id=user.id,
        data=data,
    )
    return report_to_response(report)


@router.put("/{report_id}", response_model=ScheduledReportResponse)
def update_existing_report(
    report_id: str,
    data: ScheduledReportUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Update a scheduled report."""
    report = get_scheduled_report(db, report_id=report_id, account_id=user.account_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report not found",
        )
    
    updated = update_scheduled_report(db, report, data)
    return report_to_response(updated)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Delete a scheduled report."""
    report = get_scheduled_report(db, report_id=report_id, account_id=user.account_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report not found",
        )
    
    delete_scheduled_report(db, report)
    return None


@router.post("/{report_id}/toggle", response_model=ScheduledReportResponse)
def toggle_report_active(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Toggle a report's active status."""
    report = get_scheduled_report(db, report_id=report_id, account_id=user.account_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report not found",
        )
    
    data = ScheduledReportUpdate(is_active=not report.is_active)
    updated = update_scheduled_report(db, report, data)
    return report_to_response(updated)


@router.post("/{report_id}/send-test", status_code=status.HTTP_200_OK)
def send_test_report(
    report_id: str,
    data: SendTestReportRequest,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Send a test report to the specified email."""
    report = get_scheduled_report(db, report_id=report_id, account_id=user.account_id)
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Scheduled report not found",
        )
    
    # Generate email message
    from app.services.email_service import get_weekly_report_email, send_email
    
    # Mock data for test report (since we don't have a full report generator service yet)
    # In a real scenario, this would call the report generation logic
    email_msg = get_weekly_report_email(
        user_name=user.full_name or user.email,
        account_name=user.account_id, # Should get real account name
        period="Test Report",
        total_spend=1234.56,
        total_revenue=5678.90,
        total_roas=4.6,
        top_campaigns=[{"name": "Test Campaign", "spend": 500, "roas": 5.0}],
        dashboard_url=f"{settings.FRONTEND_URL}/dashboard"
    )
    email_msg.to = data.email
    
    # Send in background
    background_tasks.add_task(send_email, email_msg)

    return {
        "message": f"Test report queued for delivery to {data.email}",
        "report_id": report_id,
        "email": data.email,
    }


@router.get("/types/options", response_model=dict)
def get_report_options(
    user=Depends(get_current_account_user),
):
    """Get available report types and frequencies."""
    return {
        "frequencies": [
            {"value": f.value, "label": f.value.capitalize()}
            for f in ReportFrequency
        ],
        "report_types": [
            {"value": t.value, "label": t.value.replace("_", " ").title()}
            for t in ReportType
        ],
        "days_of_week": [
            {"value": d, "label": d.capitalize()}
            for d in ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"]
        ],
        "timezones": [
            "UTC", "America/New_York", "America/Chicago", "America/Denver",
            "America/Los_Angeles", "Europe/London", "Europe/Paris", 
            "Europe/Berlin", "Asia/Tokyo", "Asia/Shanghai", "Australia/Sydney",
        ],
    }
