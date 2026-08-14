import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean
from app.database import Base


class Integration(Base):
    __tablename__ = "integrations"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String(100), nullable=False)  # prometheus, grafana, slack, github, pagerduty, datadog, aws, gcp
    name = Column(String(255), nullable=False)
    config_json = Column(JSON, nullable=True)
    status = Column(String(50), default="connected")  # connected, disconnected, error
    is_active = Column(Boolean, default=True)
    last_sync = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
