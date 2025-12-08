"""
Routes for custom report management.
"""
import json
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.routers.deps import get_current_account_user, get_db
from app.models.custom_report import CustomReport
from app.schemas.custom_report import (
    CustomReportCreate,
    CustomReportUpdate,
    CustomReportResponse,
    CustomReportListResponse,
    ReportResultsResponse,
    ReportConfig,
)
from app.services import custom_report_service

router = APIRouter()


def _report_to_response(report: CustomReport) -> CustomReportResponse:
    """Convert a CustomReport model to a response schema."""
    config_dict = json.loads(report.config_json) if report.config_json else {}
    return CustomReportResponse(
        id=report.id,
        name=report.name,
        description=report.description,
        config=ReportConfig(**config_dict),
        visualization_type=report.visualization_type,
        is_shared=report.is_shared,
        is_favorite=report.is_favorite,
        last_run_at=report.last_run_at,
        created_at=report.created_at,
        updated_at=report.updated_at,
        user_id=report.user_id,
    )


@router.get("", response_model=CustomReportListResponse)
def list_custom_reports(
    include_shared: bool = Query(True),
    favorites_only: bool = Query(False),
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """List all custom reports for the current account."""
    total, items = custom_report_service.get_custom_reports(
        db=db,
        account_id=user.account_id,
        user_id=user.id,
        include_shared=include_shared,
        favorites_only=favorites_only,
        limit=limit,
        offset=offset,
    )
    
    return CustomReportListResponse(
        items=[_report_to_response(r) for r in items],
        total=total,
    )


@router.get("/metadata")
def get_report_metadata():
    """Get available metrics and dimensions for report builder."""
    return custom_report_service.get_report_metadata()


@router.post("", response_model=CustomReportResponse, status_code=status.HTTP_201_CREATED)
def create_custom_report(
    data: CustomReportCreate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Create a new custom report."""
    report = custom_report_service.create_custom_report(
        db=db,
        account_id=user.account_id,
        user_id=user.id,
        data=data,
    )
    return _report_to_response(report)


@router.get("/{report_id}", response_model=CustomReportResponse)
def get_custom_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Get a specific custom report."""
    report = custom_report_service.get_custom_report(
        db=db,
        report_id=report_id,
        account_id=user.account_id,
        user_id=user.id,
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    
    return _report_to_response(report)


@router.put("/{report_id}", response_model=CustomReportResponse)
def update_custom_report(
    report_id: str,
    data: CustomReportUpdate,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Update a custom report."""
    report = custom_report_service.get_custom_report(
        db=db,
        report_id=report_id,
        account_id=user.account_id,
        user_id=user.id,
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    
    updated = custom_report_service.update_custom_report(
        db=db,
        report=report,
        user_id=user.id,
        data=data,
    )
    
    if not updated:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reports",
        )
    
    return _report_to_response(updated)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_custom_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Delete a custom report."""
    report = custom_report_service.get_custom_report(
        db=db,
        report_id=report_id,
        account_id=user.account_id,
        user_id=user.id,
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    
    deleted = custom_report_service.delete_custom_report(
        db=db,
        report=report,
        user_id=user.id,
    )
    
    if not deleted:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reports",
        )
    
    return None


@router.post("/{report_id}/duplicate", response_model=CustomReportResponse, status_code=status.HTTP_201_CREATED)
def duplicate_custom_report(
    report_id: str,
    new_name: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Duplicate an existing custom report."""
    report = custom_report_service.get_custom_report(
        db=db,
        report_id=report_id,
        account_id=user.account_id,
        user_id=user.id,
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    
    new_report = custom_report_service.duplicate_custom_report(
        db=db,
        report=report,
        user_id=user.id,
        new_name=new_name,
    )
    
    return _report_to_response(new_report)


@router.post("/{report_id}/run", response_model=ReportResultsResponse)
def run_custom_report(
    report_id: str,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Execute a saved custom report and return results."""
    report = custom_report_service.get_custom_report(
        db=db,
        report_id=report_id,
        account_id=user.account_id,
        user_id=user.id,
    )
    
    if not report:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report not found",
        )
    
    config_dict = json.loads(report.config_json) if report.config_json else {}
    config = ReportConfig(**config_dict)
    
    results = custom_report_service.execute_custom_report(
        db=db,
        account_id=user.account_id,
        config=config,
    )
    
    # Update last_run_at
    report.last_run_at = datetime.utcnow()
    db.commit()
    
    return ReportResultsResponse(
        report_id=report_id,
        data=results["data"],
        summary=results["summary"],
        total_rows=results["total_rows"],
        executed_at=datetime.utcnow(),
        comparison_data=results["comparison_data"],
        comparison_summary=results["comparison_summary"],
    )


@router.post("/preview", response_model=ReportResultsResponse)
def preview_report(
    config: ReportConfig,
    db: Session = Depends(get_db),
    user=Depends(get_current_account_user),
):
    """Preview report results without saving the report."""
    results = custom_report_service.execute_custom_report(
        db=db,
        account_id=user.account_id,
        config=config,
    )
    
    return ReportResultsResponse(
        report_id="preview",
        data=results["data"],
        summary=results["summary"],
        total_rows=results["total_rows"],
        executed_at=datetime.utcnow(),
        comparison_data=results["comparison_data"],
        comparison_summary=results["comparison_summary"],
    )
