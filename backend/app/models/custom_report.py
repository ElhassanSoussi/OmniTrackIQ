"""
Custom reports model for user-created analytics reports.
"""
import uuid
from enum import Enum

from sqlalchemy import Column, DateTime, ForeignKey, String, Text, Enum as SQLEnum, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db import Base


class VisualizationType(str, Enum):
    """Types of visualizations for custom reports."""
    TABLE = "table"
    LINE_CHART = "line_chart"
    BAR_CHART = "bar_chart"
    PIE_CHART = "pie_chart"
    AREA_CHART = "area_chart"
    METRIC_CARDS = "metric_cards"


class CustomReport(Base):
    """User-created custom report configuration."""
    __tablename__ = "custom_reports"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    account_id = Column(String, ForeignKey("accounts.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    name = Column(String(100), nullable=False)
    description = Column(String(500), nullable=True)
    
    # Report configuration stored as JSON
    # Contains: metrics, dimensions, filters, date_range, visualization_type, etc.
    config_json = Column(Text, nullable=False, default="{}")
    
    # Default visualization type
    visualization_type = Column(
        SQLEnum(VisualizationType), 
        nullable=False, 
        default=VisualizationType.TABLE
    )
    
    # Sharing settings
    is_shared = Column(Boolean, nullable=False, default=False)
    is_favorite = Column(Boolean, nullable=False, default=False)
    
    # Last run timestamp for caching purposes
    last_run_at = Column(DateTime(timezone=True), nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    account = relationship("Account", backref="custom_reports")
    user = relationship("User", backref="custom_reports")
