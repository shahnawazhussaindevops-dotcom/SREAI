import uuid
from datetime import datetime
from sqlalchemy import Column, String, DateTime, ForeignKey, Integer, Float, JSON, Text
from sqlalchemy.orm import relationship
from app.database import Base


class Asset(Base):
    __tablename__ = "assets"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    type = Column(String(50), nullable=False)  # server, pod, service, database, loadbalancer
    name = Column(String(255), nullable=False)
    status = Column(String(50), default="healthy")
    environment = Column(String(50), default="production")
    metadata_json = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Cluster(Base):
    __tablename__ = "clusters"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    provider = Column(String(50), default="aws")  # aws, gcp, azure, on-prem
    region = Column(String(100), nullable=True)
    node_count = Column(Integer, default=0)
    status = Column(String(50), default="healthy")
    k8s_version = Column(String(50), nullable=True)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    nodes = relationship("Node", back_populates="cluster")


class Node(Base):
    __tablename__ = "nodes"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    cluster_id = Column(String, ForeignKey("clusters.id"), nullable=False)
    name = Column(String(255), nullable=False)
    ip = Column(String(50), nullable=True)
    instance_type = Column(String(100), nullable=True)
    cpu_cores = Column(Integer, default=4)
    memory_gb = Column(Float, default=16.0)
    disk_gb = Column(Float, default=100.0)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    disk_usage = Column(Float, default=0.0)
    status = Column(String(50), default="healthy")
    created_at = Column(DateTime, default=datetime.utcnow)

    cluster = relationship("Cluster", back_populates="nodes")
    pods = relationship("Pod", back_populates="node")


class Service(Base):
    __tablename__ = "services"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    org_id = Column(String, ForeignKey("organizations.id"), nullable=False)
    name = Column(String(255), nullable=False)
    namespace = Column(String(255), default="default")
    type = Column(String(50), default="microservice")  # microservice, database, cache, queue, gateway
    version = Column(String(50), nullable=True)
    health = Column(String(50), default="healthy")
    replicas = Column(Integer, default=3)
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    request_rate = Column(Float, default=0.0)
    error_rate = Column(Float, default=0.0)
    p99_latency = Column(Float, default=0.0)
    environment = Column(String(50), default="production")
    owner_team = Column(String(255), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    pods = relationship("Pod", back_populates="service")
    deployments = relationship("Deployment", back_populates="service")


class Pod(Base):
    __tablename__ = "pods"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    node_id = Column(String, ForeignKey("nodes.id"), nullable=False)
    service_id = Column(String, ForeignKey("services.id"), nullable=True)
    name = Column(String(255), nullable=False)
    namespace = Column(String(255), default="default")
    status = Column(String(50), default="Running")
    cpu_usage = Column(Float, default=0.0)
    memory_usage = Column(Float, default=0.0)
    restarts = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)

    node = relationship("Node", back_populates="pods")
    service = relationship("Service", back_populates="pods")


class Deployment(Base):
    __tablename__ = "deployments"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    service_id = Column(String, ForeignKey("services.id"), nullable=False)
    version = Column(String(50), nullable=False)
    status = Column(String(50), default="success")  # success, failed, rolling, pending
    deployed_by = Column(String(255), nullable=True)
    commit_sha = Column(String(100), nullable=True)
    environment = Column(String(50), default="production")
    deployed_at = Column(DateTime, default=datetime.utcnow)
    rollback_to = Column(String, nullable=True)

    service = relationship("Service", back_populates="deployments")


class DependencyEdge(Base):
    __tablename__ = "dependency_edges"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    source_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    target_service_id = Column(String, ForeignKey("services.id"), nullable=False)
    type = Column(String(50), default="http")  # http, grpc, tcp, queue
    latency_p99 = Column(Float, nullable=True)
    request_rate = Column(Float, nullable=True)
    error_rate = Column(Float, default=0.0)

    source_service = relationship("Service", foreign_keys=[source_service_id])
    target_service = relationship("Service", foreign_keys=[target_service_id])
