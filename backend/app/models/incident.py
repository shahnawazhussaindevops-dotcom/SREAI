import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON, Text, Boolean
from app.database import Base


class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    source = Column(String(100), default="prometheus")
    severity = Column(String(50), default="medium")  # critical, high, medium, low
    title = Column(String(500), nullable=False)
    message = Column(Text, nullable=True)
    service_name = Column(String(255), nullable=True)
    status = Column(String(50), default="firing")  # firing, resolved, acknowledged
    labels = Column(JSON, nullable=True)
    fired_at = Column(DateTime, default=datetime.utcnow)
    resolved_at = Column(DateTime, nullable=True)


class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    incident_number = Column(String(50), unique=True, nullable=False)
    title = Column(String(500), nullable=False)
    description = Column(Text, nullable=True)
    severity = Column(String(50), default="medium")  # critical, high, medium, low
    status = Column(String(50), default="investigating")  # investigating, identified, monitoring, resolved
    service_name = Column(String(255), nullable=True)
    environment = Column(String(50), default="production")
    started_at = Column(DateTime, default=datetime.utcnow)
    identified_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    mttr_seconds = Column(Integer, nullable=True)
    ai_summary = Column(Text, nullable=True)
    root_cause = Column(Text, nullable=True)
    confidence_score = Column(Float, nullable=True)
    contributing_factors = Column(JSON, nullable=True)
    affected_services = Column(JSON, nullable=True)
    assigned_to = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class ChangeEvent(Base):
    __tablename__ = "change_events"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String(100), nullable=False)  # deployment, config_change, scaling, rollback
    source = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    service_name = Column(String(255), nullable=True)
    user_name = Column(String(255), nullable=True)
    metadata_json = Column(JSON, nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)


class Runbook(Base):
    __tablename__ = "runbooks"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    script = Column(Text, nullable=False)
    trigger = Column(String(255), nullable=True)
    category = Column(String(100), default="general")
    is_active = Column(Boolean, default=True)
    requires_approval = Column(Boolean, default=True)
    last_executed = Column(DateTime, nullable=True)
    execution_count = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class RemediationAction(Base):
    __tablename__ = "remediation_actions"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)
    runbook_id = Column(String, ForeignKey("runbooks.id"), nullable=True)
    action_type = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    status = Column(String(50), default="pending")  # pending, approved, executing, completed, failed
    executed_by = Column(String(255), nullable=True)
    approved_by = Column(String(255), nullable=True)
    output = Column(Text, nullable=True)
    executed_at = Column(DateTime, nullable=True)
    completed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SimulationScenario(Base):
    __tablename__ = "simulation_scenarios"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    scenario_type = Column(String(100), nullable=False)  # pod_failure, node_failure, traffic_spike, etc
    target_resource = Column(String(255), nullable=False)
    parameters_json = Column(JSON, nullable=True)
    result_json = Column(JSON, nullable=True)
    risk_score = Column(Float, nullable=True)
    blast_radius = Column(String(100), nullable=True)
    status = Column(String(50), default="completed")
    created_by = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class CostItem(Base):
    __tablename__ = "cost_items"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    resource_type = Column(String(100), nullable=False)  # compute, storage, database, network, other
    resource_name = Column(String(255), nullable=False)
    monthly_cost = Column(Float, default=0.0)
    waste_type = Column(String(100), nullable=True)  # idle, overprovisioned, unused
    potential_savings = Column(Float, default=0.0)
    region = Column(String(100), nullable=True)
    details = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class SecurityFinding(Base):
    __tablename__ = "security_findings"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    severity = Column(String(50), default="medium")  # critical, high, medium, low
    category = Column(String(100), nullable=False)  # exposed_port, weak_iam, vulnerable_image, secret_exposure
    resource = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    remediation = Column(Text, nullable=True)
    status = Column(String(50), default="open")  # open, mitigated, accepted
    cve_id = Column(String(100), nullable=True)
    discovered_at = Column(DateTime, default=datetime.utcnow)


class Postmortem(Base):
    __tablename__ = "postmortems"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    summary = Column(Text, nullable=True)
    timeline = Column(JSON, nullable=True)
    root_cause_detail = Column(Text, nullable=True)
    lessons_learned = Column(JSON, nullable=True)
    action_items = Column(JSON, nullable=True)
    generated_by_ai = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    user_id = Column(String, ForeignKey("users.id"), nullable=True)
    action = Column(String(255), nullable=False)
    resource_type = Column(String(100), nullable=True)
    resource_id = Column(String, nullable=True)
    details = Column(JSON, nullable=True)
    ip_address = Column(String(50), nullable=True)
    timestamp = Column(DateTime, default=datetime.utcnow)
