"""
Service for scheduled report management.
"""
from datetime import datetime, timedelta
from typing import List, Optional, Tuple
from sqlalchemy.orm import Session

from app.models.scheduled_report import ScheduledReport, ReportFrequency, ReportType
from app.schemas.scheduled_report import (
    ScheduledReportCreate,
    ScheduledReportUpdate,
    ScheduledReportResponse,
)


def calculate_next_send_time(
    frequency: ReportFrequency,
    send_time: str,
    timezone: str,
    day_of_week: Optional[str] = None,
    day_of_month: Optional[str] = None,
    from_datetime: Optional[datetime] = None,
) -> datetime:
    """Calculate the next scheduled send time."""
    from_datetime = from_datetime or datetime.utcnow()
    
    # Parse send_time
    hour, minute = map(int, send_time.split(":"))
    
    # Start from today at the specified time
    next_send = from_datetime.replace(hour=hour, minute=minute, second=0, microsecond=0)
    
    # If the time has already passed today, start from tomorrow
    if next_send <= from_datetime:
        next_send += timedelta(days=1)
    
    if frequency == ReportFrequency.DAILY:
        return next_send
    
    elif frequency == ReportFrequency.WEEKLY:
        day_map = {
            "monday": 0, "tuesday": 1, "wednesday": 2, "thursday": 3,
            "friday": 4, "saturday": 5, "sunday": 6,
        }
        target_day = day_map.get(day_of_week, 0)  # Default to Monday
        current_day = next_send.weekday()
        days_ahead = target_day - current_day
        if days_ahead <= 0:
            days_ahead += 7
        return next_send + timedelta(days=days_ahead)
    
    elif frequency == ReportFrequency.MONTHLY:
        target_day = int(day_of_month) if day_of_month else 1
        # Try this month first
        try:
            next_send = next_send.replace(day=target_day)
            if next_send <= from_datetime:
                # Go to next month
                if next_send.month == 12:
                    next_send = next_send.replace(year=next_send.year + 1, month=1)
                else:
                    next_send = next_send.replace(month=next_send.month + 1)
        except ValueError:
            # Day doesn't exist in this month, use last day of month
            if next_send.month == 12:
                next_month = next_send.replace(year=next_send.year + 1, month=1, day=1)
            else:
                next_month = next_send.replace(month=next_send.month + 1, day=1)
            next_send = next_month - timedelta(days=1)
            next_send = next_send.replace(hour=hour, minute=minute, second=0, microsecond=0)
        
        return next_send
    
    return next_send


def get_scheduled_reports(
    db: Session,
    account_id: str,
    is_active: Optional[bool] = None,
    limit: int = 50,
    offset: int = 0,
) -> Tuple[int, List[ScheduledReport]]:
    """Get all scheduled reports for an account."""
    query = db.query(ScheduledReport).filter(ScheduledReport.account_id == account_id)
    
    if is_active is not None:
        query = query.filter(ScheduledReport.is_active == is_active)
    
    total = query.count()
    items = query.order_by(ScheduledReport.created_at.desc()).offset(offset).limit(limit).all()
    
    return total, items


def get_scheduled_report(
    db: Session,
    report_id: str,
    account_id: str,
) -> Optional[ScheduledReport]:
    """Get a specific scheduled report."""
    return db.query(ScheduledReport).filter(
        ScheduledReport.id == report_id,
        ScheduledReport.account_id == account_id,
    ).first()


def create_scheduled_report(
    db: Session,
    account_id: str,
    user_id: str,
    data: ScheduledReportCreate,
) -> ScheduledReport:
    """Create a new scheduled report."""
    next_send = calculate_next_send_time(
        frequency=data.frequency,
        send_time=data.send_time,
        timezone=data.timezone,
        day_of_week=data.day_of_week,
        day_of_month=data.day_of_month,
    )
    
    report = ScheduledReport(
        account_id=account_id,
        created_by=user_id,
        name=data.name,
        report_type=data.report_type,
        frequency=data.frequency,
        recipients=data.recipients,
        date_range_days=data.date_range_days,
        platforms=data.platforms,
        metrics=data.metrics,
        send_time=data.send_time,
        timezone=data.timezone,
        day_of_week=data.day_of_week,
        day_of_month=data.day_of_month,
        is_active=True,
        next_send_at=next_send,
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def update_scheduled_report(
    db: Session,
    report: ScheduledReport,
    data: ScheduledReportUpdate,
) -> ScheduledReport:
    """Update a scheduled report."""
    recalculate_next_send = False
    
    if data.name is not None:
        report.name = data.name
    
    if data.report_type is not None:
        report.report_type = data.report_type
    
    if data.frequency is not None:
        report.frequency = data.frequency
        recalculate_next_send = True
    
    if data.recipients is not None:
        report.recipients = data.recipients
    
    if data.date_range_days is not None:
        report.date_range_days = data.date_range_days
    
    if data.platforms is not None:
        report.platforms = data.platforms
    
    if data.metrics is not None:
        report.metrics = data.metrics
    
    if data.is_active is not None:
        report.is_active = data.is_active
    
    if data.send_time is not None:
        report.send_time = data.send_time
        recalculate_next_send = True
    
    if data.timezone is not None:
        report.timezone = data.timezone
        recalculate_next_send = True
    
    if data.day_of_week is not None:
        report.day_of_week = data.day_of_week
        recalculate_next_send = True
    
    if data.day_of_month is not None:
        report.day_of_month = data.day_of_month
        recalculate_next_send = True
    
    # Recalculate next send time if scheduling changed
    if recalculate_next_send:
        report.next_send_at = calculate_next_send_time(
            frequency=report.frequency,
            send_time=report.send_time,
            timezone=report.timezone,
            day_of_week=report.day_of_week,
            day_of_month=report.day_of_month,
        )
    
    db.commit()
    db.refresh(report)
    return report


def delete_scheduled_report(
    db: Session,
    report: ScheduledReport,
) -> bool:
    """Delete a scheduled report."""
    db.delete(report)
    db.commit()
    return True


def mark_report_sent(
    db: Session,
    report: ScheduledReport,
) -> ScheduledReport:
    """Mark a report as sent and calculate next send time."""
    report.last_sent_at = datetime.utcnow()
    report.send_count = str(int(report.send_count or "0") + 1)
    report.next_send_at = calculate_next_send_time(
        frequency=report.frequency,
        send_time=report.send_time,
        timezone=report.timezone,
        day_of_week=report.day_of_week,
        day_of_month=report.day_of_month,
    )
    
    db.commit()
    db.refresh(report)
    return report


def get_pending_reports(db: Session) -> List[ScheduledReport]:
    """Get all reports that are due to be sent."""
    now = datetime.utcnow()
    return db.query(ScheduledReport).filter(
        ScheduledReport.is_active == True,
        ScheduledReport.next_send_at <= now,
    ).all()


def report_to_response(report: ScheduledReport) -> ScheduledReportResponse:
    """Convert a ScheduledReport model to response schema."""
    return ScheduledReportResponse(
        id=report.id,
        name=report.name,
        report_type=report.report_type,
        frequency=report.frequency,
        recipients=report.recipients or [],
        date_range_days=report.date_range_days or "30",
        platforms=report.platforms or [],
        metrics=report.metrics or [],
        is_active=report.is_active,
        send_time=report.send_time or "09:00",
        timezone=report.timezone or "UTC",
        day_of_week=report.day_of_week,
        day_of_month=report.day_of_month,
        last_sent_at=report.last_sent_at,
        next_send_at=report.next_send_at,
        send_count=int(report.send_count or "0"),
        created_by=report.created_by,
        created_at=report.created_at,
        updated_at=report.updated_at,
    )
