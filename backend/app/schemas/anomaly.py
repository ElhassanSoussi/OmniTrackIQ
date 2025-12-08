"""
Pydantic schemas for anomaly detection.
"""
from typing import List, Optional, Dict, Any
from enum import Enum

from pydantic import BaseModel, Field


class AnomalyType(str, Enum):
    """Types of anomalies."""
    spike = "spike"
    drop = "drop"
    trend_change = "trend_change"
    zero_value = "zero_value"


class AnomalySeverity(str, Enum):
    """Severity levels."""
    low = "low"
    medium = "medium"
    high = "high"
    critical = "critical"


class Sensitivity(str, Enum):
    """Detection sensitivity levels."""
    low = "low"
    medium = "medium"
    high = "high"


class AnomalyItem(BaseModel):
    """Single detected anomaly."""
    date: str = Field(..., description="Date of the anomaly")
    metric: str = Field(..., description="Metric identifier")
    metric_label: str = Field(..., description="Human-readable metric name")
    type: AnomalyType = Field(..., description="Type of anomaly")
    severity: AnomalySeverity = Field(..., description="Severity level")
    value: float = Field(..., description="Actual value")
    expected_value: float = Field(..., description="Expected/baseline value")
    z_score: Optional[float] = Field(None, description="Z-score (standard deviations from mean)")
    deviation_percent: float = Field(..., description="Percentage deviation from expected")
    is_concerning: bool = Field(False, description="Whether this anomaly requires attention")
    description: str = Field(..., description="Human-readable description")


class AnomalySummary(BaseModel):
    """Summary of detected anomalies."""
    total_anomalies: int = Field(0, description="Total number of anomalies")
    concerning_anomalies: int = Field(0, description="Number of concerning anomalies")
    by_severity: Dict[str, int] = Field(default_factory=dict, description="Count by severity")
    by_metric: Dict[str, int] = Field(default_factory=dict, description="Count by metric")
    by_type: Dict[str, int] = Field(default_factory=dict, description="Count by type")


class DateRange(BaseModel):
    """Date range."""
    from_date: str = Field(..., alias="from")
    to_date: str = Field(..., alias="to")
    
    class Config:
        populate_by_name = True


class AnomalyDetectionResponse(BaseModel):
    """Response for anomaly detection endpoint."""
    anomalies: List[AnomalyItem] = Field(default_factory=list, description="Detected anomalies")
    summary: AnomalySummary = Field(..., description="Summary statistics")
    date_range: DateRange = Field(..., description="Date range analyzed")
    sensitivity: str = Field(..., description="Sensitivity level used")
    metrics_analyzed: List[str] = Field(..., description="Metrics that were analyzed")
    message: Optional[str] = Field(None, description="Optional message")


class AnomalyTimelinePoint(BaseModel):
    """Single point in anomaly timeline."""
    date: str = Field(..., description="Date")
    count: int = Field(0, description="Number of anomalies on this date")
    concerning: int = Field(0, description="Number of concerning anomalies")
    anomalies: List[Dict[str, str]] = Field(default_factory=list, description="Brief anomaly info")


class AnomalyTrendsResponse(BaseModel):
    """Response for anomaly trends endpoint."""
    timeline: List[AnomalyTimelinePoint] = Field(default_factory=list, description="Daily anomaly counts")
    total_days_with_anomalies: int = Field(0, description="Days that had anomalies")
    date_range: DateRange = Field(..., description="Date range analyzed")


class MetricHealth(BaseModel):
    """Health status of a single metric."""
    metric: str = Field(..., description="Metric identifier")
    label: str = Field(..., description="Human-readable label")
    current_value: float = Field(..., description="Recent average value")
    previous_value: float = Field(..., description="Historical average value")
    change_percent: float = Field(..., description="Percentage change")
    status: str = Field(..., description="Health status (stable, improving, declining, critical)")
    status_color: str = Field(..., description="Color indicator (green, yellow, red)")
    trend: str = Field(..., description="Trend direction (up, down, flat)")


class MetricHealthResponse(BaseModel):
    """Response for metric health endpoint."""
    metrics: List[MetricHealth] = Field(default_factory=list, description="Health status per metric")
    overall_health: str = Field(..., description="Overall health status")
    date_range: DateRange = Field(..., description="Date range analyzed")
    message: Optional[str] = Field(None, description="Optional message")


class AnomalyMetadata(BaseModel):
    """Available options for anomaly detection."""
    metrics: List[Dict[str, str]] = Field(..., description="Available metrics to monitor")
    severity_levels: List[str] = Field(..., description="Severity levels")
    anomaly_types: List[str] = Field(..., description="Types of anomalies")
    sensitivity_levels: List[str] = Field(..., description="Sensitivity levels")
