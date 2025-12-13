from typing import List, Optional
from sqlalchemy.orm import Session
from fastapi import HTTPException, status

from app.models.report_template import ReportTemplate
from app.models.custom_metric import CustomMetric
from app.schemas.analytics_mgmt import (
    ReportTemplateCreate, CustomMetricCreate,
    ReportTemplateUpdate, CustomMetricUpdate
)

# --- Report Templates ---

def create_report_template(db: Session, template_in: ReportTemplateCreate, account_id: str, user_id: str) -> ReportTemplate:
    template = ReportTemplate(
        account_id=account_id,
        created_by_user_id=user_id,
        name=template_in.name,
        description=template_in.description,
        config_json=template_in.config_json,
        is_public=template_in.is_public
    )
    db.add(template)
    db.commit()
    db.refresh(template)
    return template

def get_report_templates(db: Session, account_id: str) -> List[ReportTemplate]:
    return db.query(ReportTemplate).filter(ReportTemplate.account_id == account_id).all()

def get_report_template(db: Session, template_id: str, account_id: str) -> Optional[ReportTemplate]:
    return db.query(ReportTemplate).filter(
        ReportTemplate.id == template_id,
        ReportTemplate.account_id == account_id
    ).first()

def delete_report_template(db: Session, template_id: str, account_id: str):
    template = get_report_template(db, template_id, account_id)
    if not template:
        raise HTTPException(status_code=404, detail="Template not found")
    
    db.delete(template)
    db.commit()
    return True

# --- Custom Metrics ---

def create_custom_metric(db: Session, metric_in: CustomMetricCreate, account_id: str, user_id: str) -> CustomMetric:
    metric = CustomMetric(
        account_id=account_id,
        created_by_user_id=user_id,
        name=metric_in.name,
        description=metric_in.description,
        formula=metric_in.formula,
        format=metric_in.format
    )
    db.add(metric)
    db.commit()
    db.refresh(metric)
    return metric

def get_custom_metrics(db: Session, account_id: str) -> List[CustomMetric]:
    return db.query(CustomMetric).filter(CustomMetric.account_id == account_id).all()

def get_custom_metric(db: Session, metric_id: str, account_id: str) -> Optional[CustomMetric]:
    return db.query(CustomMetric).filter(
        CustomMetric.id == metric_id,
        CustomMetric.account_id == account_id
    ).first()

def delete_custom_metric(db: Session, metric_id: str, account_id: str):
    metric = get_custom_metric(db, metric_id, account_id)
    if not metric:
        raise HTTPException(status_code=404, detail="Custom Metric not found")
    
    db.delete(metric)
    db.commit()
    return True
