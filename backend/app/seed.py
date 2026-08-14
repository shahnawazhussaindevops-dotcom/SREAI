"""
SREAI Demo Seed Data
Populates the database with realistic infrastructure, incidents, costs, and security data.
"""
import uuid
from datetime import datetime, timedelta
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ORG_ID = "org-acme-001"
ADMIN_ID = "user-admin-001"
ENG_ID = "user-eng-001"
VIEWER_ID = "user-viewer-001"

# ── Organization ──────────────────────────────────────────
ORGANIZATIONS = [
    {
        "id": ORG_ID,
        "name": "Acme Corp",
        "slug": "acme-corp",
        "plan": "enterprise",
    }
]

# ── Users ─────────────────────────────────────────────────
USERS = [
    {
        "id": ADMIN_ID,
        "org_id": ORG_ID,
        "email": "admin@acme.com",
        "password_hash": pwd_context.hash("admin123"),
        "name": "Sarah Chen",
        "role": "admin",
    },
    {
        "id": ENG_ID,
        "org_id": ORG_ID,
        "email": "engineer@acme.com",
        "password_hash": pwd_context.hash("engineer123"),
        "name": "Marcus Johnson",
        "role": "engineer",
    },
    {
        "id": VIEWER_ID,
        "org_id": ORG_ID,
        "email": "viewer@acme.com",
        "password_hash": pwd_context.hash("viewer123"),
        "name": "Alex Rivera",
        "role": "viewer",
    },
]

# ── Clusters ──────────────────────────────────────────────
CLUSTER_PROD = "cluster-prod-001"
CLUSTER_STAGING = "cluster-staging-001"
CLUSTER_DEV = "cluster-dev-001"

CLUSTERS = [
    {
        "id": CLUSTER_PROD,
        "org_id": ORG_ID,
        "name": "production-us-east-1",
        "provider": "aws",
        "region": "us-east-1",
        "node_count": 4,
        "status": "healthy",
        "k8s_version": "1.28.4",
        "cpu_usage": 68.0,
        "memory_usage": 72.0,
    },
    {
        "id": CLUSTER_STAGING,
        "org_id": ORG_ID,
        "name": "staging-us-west-2",
        "provider": "aws",
        "region": "us-west-2",
        "node_count": 3,
        "status": "healthy",
        "k8s_version": "1.28.4",
        "cpu_usage": 42.0,
        "memory_usage": 55.0,
    },
    {
        "id": CLUSTER_DEV,
        "org_id": ORG_ID,
        "name": "dev-eu-west-1",
        "provider": "aws",
        "region": "eu-west-1",
        "node_count": 2,
        "status": "healthy",
        "k8s_version": "1.29.1",
        "cpu_usage": 25.0,
        "memory_usage": 30.0,
    },
]

# ── Nodes ─────────────────────────────────────────────────
NODE_IDS = [f"node-{i:03d}" for i in range(1, 10)]

NODES = [
    {"id": NODE_IDS[0], "cluster_id": CLUSTER_PROD, "name": "k8s-node-1", "ip": "10.0.1.11", "instance_type": "m5.2xlarge", "cpu_cores": 8, "memory_gb": 32, "disk_gb": 200, "cpu_usage": 72, "memory_usage": 68, "disk_usage": 55, "status": "healthy"},
    {"id": NODE_IDS[1], "cluster_id": CLUSTER_PROD, "name": "k8s-node-2", "ip": "10.0.1.12", "instance_type": "m5.2xlarge", "cpu_cores": 8, "memory_gb": 32, "disk_gb": 200, "cpu_usage": 65, "memory_usage": 74, "disk_usage": 48, "status": "healthy"},
    {"id": NODE_IDS[2], "cluster_id": CLUSTER_PROD, "name": "k8s-node-3", "ip": "10.0.1.13", "instance_type": "m5.xlarge", "cpu_cores": 4, "memory_gb": 16, "disk_gb": 100, "cpu_usage": 88, "memory_usage": 82, "disk_usage": 72, "status": "degraded"},
    {"id": NODE_IDS[3], "cluster_id": CLUSTER_PROD, "name": "k8s-node-4", "ip": "10.0.1.14", "instance_type": "m5.xlarge", "cpu_cores": 4, "memory_gb": 16, "disk_gb": 100, "cpu_usage": 45, "memory_usage": 52, "disk_usage": 38, "status": "healthy"},
    {"id": NODE_IDS[4], "cluster_id": CLUSTER_STAGING, "name": "staging-node-1", "ip": "10.0.2.11", "instance_type": "m5.large", "cpu_cores": 2, "memory_gb": 8, "disk_gb": 50, "cpu_usage": 35, "memory_usage": 48, "disk_usage": 42, "status": "healthy"},
    {"id": NODE_IDS[5], "cluster_id": CLUSTER_STAGING, "name": "staging-node-2", "ip": "10.0.2.12", "instance_type": "m5.large", "cpu_cores": 2, "memory_gb": 8, "disk_gb": 50, "cpu_usage": 42, "memory_usage": 55, "disk_usage": 38, "status": "healthy"},
    {"id": NODE_IDS[6], "cluster_id": CLUSTER_STAGING, "name": "staging-node-3", "ip": "10.0.2.13", "instance_type": "m5.large", "cpu_cores": 2, "memory_gb": 8, "disk_gb": 50, "cpu_usage": 28, "memory_usage": 40, "disk_usage": 30, "status": "healthy"},
    {"id": NODE_IDS[7], "cluster_id": CLUSTER_DEV, "name": "dev-node-1", "ip": "10.0.3.11", "instance_type": "t3.large", "cpu_cores": 2, "memory_gb": 8, "disk_gb": 50, "cpu_usage": 22, "memory_usage": 30, "disk_usage": 25, "status": "healthy"},
    {"id": NODE_IDS[8], "cluster_id": CLUSTER_DEV, "name": "dev-node-2", "ip": "10.0.3.12", "instance_type": "t3.large", "cpu_cores": 2, "memory_gb": 8, "disk_gb": 50, "cpu_usage": 18, "memory_usage": 25, "disk_usage": 20, "status": "healthy"},
]

# ── Services ──────────────────────────────────────────────
SVC_IDS = {
    "api_gateway": "svc-001",
    "web_frontend": "svc-002",
    "auth_service": "svc-003",
    "payment_service": "svc-004",
    "order_service": "svc-005",
    "notification_service": "svc-006",
    "mobile_api": "svc-007",
    "redis": "svc-008",
    "postgresql": "svc-009",
    "kafka": "svc-010",
    "mongodb": "svc-011",
    "user_service": "svc-012",
    "search_service": "svc-013",
    "analytics_service": "svc-014",
}

SERVICES = [
    {"id": SVC_IDS["api_gateway"], "org_id": ORG_ID, "name": "API Gateway", "namespace": "production", "type": "gateway", "version": "v2.4.1", "health": "healthy", "replicas": 3, "cpu_usage": 45, "memory_usage": 52, "request_rate": 2400, "error_rate": 0.02, "p99_latency": 12.5, "owner_team": "Platform"},
    {"id": SVC_IDS["web_frontend"], "org_id": ORG_ID, "name": "Web Frontend", "namespace": "production", "type": "microservice", "version": "v3.1.0", "health": "healthy", "replicas": 3, "cpu_usage": 32, "memory_usage": 40, "request_rate": 1800, "error_rate": 0.01, "p99_latency": 8.2, "owner_team": "Frontend"},
    {"id": SVC_IDS["auth_service"], "org_id": ORG_ID, "name": "Auth Service", "namespace": "production", "type": "microservice", "version": "v1.8.2", "health": "healthy", "replicas": 2, "cpu_usage": 28, "memory_usage": 35, "request_rate": 800, "error_rate": 0.005, "p99_latency": 15.0, "owner_team": "Security"},
    {"id": SVC_IDS["payment_service"], "org_id": ORG_ID, "name": "Payment Service", "namespace": "production", "type": "microservice", "version": "v2.0.4", "health": "degraded", "replicas": 3, "cpu_usage": 78, "memory_usage": 85, "request_rate": 450, "error_rate": 12.3, "p99_latency": 4800, "owner_team": "Payments"},
    {"id": SVC_IDS["order_service"], "org_id": ORG_ID, "name": "Order Service", "namespace": "production", "type": "microservice", "version": "v1.5.1", "health": "healthy", "replicas": 3, "cpu_usage": 55, "memory_usage": 60, "request_rate": 620, "error_rate": 0.8, "p99_latency": 45.0, "owner_team": "Commerce"},
    {"id": SVC_IDS["notification_service"], "org_id": ORG_ID, "name": "Notification Service", "namespace": "production", "type": "microservice", "version": "v1.2.0", "health": "healthy", "replicas": 2, "cpu_usage": 15, "memory_usage": 22, "request_rate": 350, "error_rate": 0.1, "p99_latency": 20.0, "owner_team": "Platform"},
    {"id": SVC_IDS["mobile_api"], "org_id": ORG_ID, "name": "Mobile API", "namespace": "production", "type": "gateway", "version": "v1.9.0", "health": "healthy", "replicas": 2, "cpu_usage": 38, "memory_usage": 45, "request_rate": 1200, "error_rate": 0.3, "p99_latency": 22.0, "owner_team": "Mobile"},
    {"id": SVC_IDS["redis"], "org_id": ORG_ID, "name": "Redis", "namespace": "production", "type": "cache", "version": "7.2", "health": "healthy", "replicas": 3, "cpu_usage": 20, "memory_usage": 65, "request_rate": 8500, "error_rate": 0.0, "p99_latency": 1.2, "owner_team": "Platform"},
    {"id": SVC_IDS["postgresql"], "org_id": ORG_ID, "name": "PostgreSQL", "namespace": "production", "type": "database", "version": "16.1", "health": "healthy", "replicas": 2, "cpu_usage": 62, "memory_usage": 78, "request_rate": 3200, "error_rate": 0.1, "p99_latency": 5.5, "owner_team": "Data"},
    {"id": SVC_IDS["kafka"], "org_id": ORG_ID, "name": "Kafka", "namespace": "production", "type": "queue", "version": "3.6", "health": "degraded", "replicas": 3, "cpu_usage": 72, "memory_usage": 80, "request_rate": 15000, "error_rate": 0.5, "p99_latency": 3.8, "owner_team": "Data"},
    {"id": SVC_IDS["mongodb"], "org_id": ORG_ID, "name": "MongoDB", "namespace": "production", "type": "database", "version": "7.0", "health": "healthy", "replicas": 3, "cpu_usage": 48, "memory_usage": 55, "request_rate": 2100, "error_rate": 0.05, "p99_latency": 8.0, "owner_team": "Data"},
    {"id": SVC_IDS["user_service"], "org_id": ORG_ID, "name": "User Service", "namespace": "production", "type": "microservice", "version": "v1.3.0", "health": "healthy", "replicas": 2, "cpu_usage": 25, "memory_usage": 30, "request_rate": 500, "error_rate": 0.02, "p99_latency": 18.0, "owner_team": "Identity"},
    {"id": SVC_IDS["search_service"], "org_id": ORG_ID, "name": "Search Service", "namespace": "production", "type": "microservice", "version": "v2.1.0", "health": "healthy", "replicas": 2, "cpu_usage": 55, "memory_usage": 70, "request_rate": 300, "error_rate": 0.1, "p99_latency": 35.0, "owner_team": "Search"},
    {"id": SVC_IDS["analytics_service"], "org_id": ORG_ID, "name": "Analytics Service", "namespace": "production", "type": "microservice", "version": "v1.0.5", "health": "healthy", "replicas": 2, "cpu_usage": 60, "memory_usage": 72, "request_rate": 200, "error_rate": 0.0, "p99_latency": 120.0, "owner_team": "Data"},
]

# ── Dependency Edges ──────────────────────────────────────
DEPENDENCY_EDGES = [
    {"id": f"edge-{i:03d}", "source_service_id": s, "target_service_id": t, "type": tp, "latency_p99": l, "request_rate": r, "error_rate": e}
    for i, (s, t, tp, l, r, e) in enumerate([
        (SVC_IDS["web_frontend"], SVC_IDS["api_gateway"], "http", 5.0, 1800, 0.01),
        (SVC_IDS["mobile_api"], SVC_IDS["api_gateway"], "http", 8.0, 1200, 0.02),
        (SVC_IDS["api_gateway"], SVC_IDS["auth_service"], "http", 12.0, 800, 0.005),
        (SVC_IDS["api_gateway"], SVC_IDS["payment_service"], "http", 4500.0, 450, 12.3),
        (SVC_IDS["api_gateway"], SVC_IDS["order_service"], "http", 35.0, 620, 0.8),
        (SVC_IDS["api_gateway"], SVC_IDS["user_service"], "http", 15.0, 500, 0.02),
        (SVC_IDS["api_gateway"], SVC_IDS["search_service"], "http", 30.0, 300, 0.1),
        (SVC_IDS["payment_service"], SVC_IDS["postgresql"], "tcp", 5.0, 450, 0.1),
        (SVC_IDS["payment_service"], SVC_IDS["redis"], "tcp", 1.0, 900, 0.0),
        (SVC_IDS["order_service"], SVC_IDS["postgresql"], "tcp", 4.5, 620, 0.05),
        (SVC_IDS["order_service"], SVC_IDS["kafka"], "tcp", 3.0, 620, 0.5),
        (SVC_IDS["auth_service"], SVC_IDS["redis"], "tcp", 1.0, 800, 0.0),
        (SVC_IDS["auth_service"], SVC_IDS["postgresql"], "tcp", 5.0, 400, 0.01),
        (SVC_IDS["notification_service"], SVC_IDS["kafka"], "tcp", 2.5, 350, 0.1),
        (SVC_IDS["user_service"], SVC_IDS["postgresql"], "tcp", 4.0, 500, 0.01),
        (SVC_IDS["user_service"], SVC_IDS["mongodb"], "tcp", 6.0, 300, 0.02),
        (SVC_IDS["search_service"], SVC_IDS["mongodb"], "tcp", 8.0, 300, 0.05),
        (SVC_IDS["analytics_service"], SVC_IDS["kafka"], "tcp", 3.5, 200, 0.0),
        (SVC_IDS["analytics_service"], SVC_IDS["postgresql"], "tcp", 5.0, 200, 0.0),
    ], 1)
]

# ── Pods ──────────────────────────────────────────────────
PODS = []
pod_counter = 1
for svc in SERVICES:
    replicas = svc.get("replicas", 2)
    for r in range(replicas):
        node_idx = (pod_counter - 1) % 4  # distribute across prod nodes
        PODS.append({
            "id": f"pod-{pod_counter:03d}",
            "node_id": NODE_IDS[node_idx],
            "service_id": svc["id"],
            "name": f"{svc['name'].lower().replace(' ', '-')}-{str(uuid.uuid4())[:8]}",
            "namespace": svc["namespace"],
            "status": "Running" if svc["health"] != "down" else "CrashLoopBackOff",
            "cpu_usage": svc["cpu_usage"] + (r * 3 - 5),
            "memory_usage": svc["memory_usage"] + (r * 2 - 3),
            "restarts": 0 if svc["health"] == "healthy" else (r + 1) * 3,
        })
        pod_counter += 1

# ── Alerts ────────────────────────────────────────────────
now = datetime.utcnow()
ALERTS = [
    {"id": "alert-001", "org_id": ORG_ID, "source": "prometheus", "severity": "critical", "title": "High API Latency", "message": "Payment Service p99 latency exceeds 4000ms threshold", "service_name": "Payment Service", "status": "firing", "fired_at": now - timedelta(minutes=2)},
    {"id": "alert-002", "org_id": ORG_ID, "source": "prometheus", "severity": "high", "title": "Pod CrashLoop", "message": "Auth Service pod auth-service-7f8a has restarted 5 times in 10 minutes", "service_name": "Auth Service", "status": "firing", "fired_at": now - timedelta(minutes=15)},
    {"id": "alert-003", "org_id": ORG_ID, "source": "grafana", "severity": "medium", "title": "Database Connection Errors", "message": "PostgreSQL connection pool utilization at 85%, active connections: 340/400", "service_name": "Order Service", "status": "firing", "fired_at": now - timedelta(minutes=32)},
    {"id": "alert-004", "org_id": ORG_ID, "source": "prometheus", "severity": "low", "title": "High Memory Usage", "message": "K8s Node 3 memory usage at 82%, approaching eviction threshold", "service_name": "k8s-node-3", "status": "firing", "fired_at": now - timedelta(hours=1)},
    {"id": "alert-005", "org_id": ORG_ID, "source": "datadog", "severity": "medium", "title": "Kafka Consumer Lag", "message": "Consumer group orders-processor lag exceeded 10000 messages", "service_name": "Kafka", "status": "firing", "fired_at": now - timedelta(minutes=45)},
    {"id": "alert-006", "org_id": ORG_ID, "source": "prometheus", "severity": "high", "title": "Disk Space Critical", "message": "Node k8s-node-3 disk usage at 72%, log volume growing rapidly", "service_name": "k8s-node-3", "status": "acknowledged", "fired_at": now - timedelta(hours=2)},
    {"id": "alert-007", "org_id": ORG_ID, "source": "prometheus", "severity": "low", "title": "Certificate Expiring", "message": "TLS certificate for api.acme.com expires in 14 days", "service_name": "API Gateway", "status": "acknowledged", "fired_at": now - timedelta(days=1)},
    {"id": "alert-008", "org_id": ORG_ID, "source": "grafana", "severity": "medium", "title": "Error Rate Spike", "message": "Payment Service error rate increased to 12.3% from baseline 0.1%", "service_name": "Payment Service", "status": "firing", "fired_at": now - timedelta(minutes=5)},
    {"id": "alert-009", "org_id": ORG_ID, "source": "prometheus", "severity": "low", "title": "CPU Throttling", "message": "Analytics Service pods experiencing CPU throttling (limit: 500m)", "service_name": "Analytics Service", "status": "resolved", "fired_at": now - timedelta(hours=4), "resolved_at": now - timedelta(hours=3)},
    {"id": "alert-010", "org_id": ORG_ID, "source": "datadog", "severity": "medium", "title": "Deployment Rollback", "message": "Search Service v2.1.1 deployment rolled back due to health check failures", "service_name": "Search Service", "status": "resolved", "fired_at": now - timedelta(hours=6), "resolved_at": now - timedelta(hours=5, minutes=30)},
]

# ── Incidents ─────────────────────────────────────────────
INCIDENTS = [
    {
        "id": "inc-001",
        "org_id": ORG_ID,
        "incident_number": "INC-2024-00123",
        "title": "High API Latency in Payment Service",
        "description": "Users are experiencing high latency during payment processing. P99 latency has increased from 45ms to 4800ms.",
        "severity": "critical",
        "status": "investigating",
        "service_name": "Payment Service",
        "environment": "production",
        "started_at": now - timedelta(minutes=32),
        "mttr_seconds": None,
        "ai_summary": "The root cause is an unusually high response time from the payment gateway API, causing a backlog of pending requests and increased latency in the Payment Service.",
        "root_cause": "External payment gateway API degradation combined with insufficient connection pool sizing and missing circuit breaker configuration.",
        "confidence_score": 92.0,
        "contributing_factors": [
            {"factor": "Slow external API calls", "detail": "GET /api/payments/charge — 4800ms", "severity": "critical"},
            {"factor": "High error rate", "detail": "Payment gateway timeout — 12.3%", "severity": "high"},
            {"factor": "High DB connections", "detail": "PostgreSQL pool at 85%", "severity": "high"},
            {"factor": "Increased traffic", "detail": "Compared to last hour — +312%", "severity": "medium"},
        ],
        "affected_services": ["Payment Service", "Order Service", "API Gateway"],
        "assigned_to": "Marcus Johnson",
    },
    {
        "id": "inc-002",
        "org_id": ORG_ID,
        "incident_number": "INC-2024-00122",
        "title": "Kafka Consumer Lag Spike",
        "description": "Order processing consumer group experiencing significant message lag, causing delayed order confirmations.",
        "severity": "high",
        "status": "identified",
        "service_name": "Kafka",
        "environment": "production",
        "started_at": now - timedelta(hours=1, minutes=15),
        "identified_at": now - timedelta(minutes=45),
        "mttr_seconds": None,
        "ai_summary": "Kafka consumer lag is caused by a slow downstream database query in the Order Service that is bottlenecking message processing throughput.",
        "root_cause": "Unoptimized database query in order validation causing consumer processing time to increase from 5ms to 200ms per message.",
        "confidence_score": 87.5,
        "contributing_factors": [
            {"factor": "Slow DB query", "detail": "ORDER BY with missing index — 195ms avg", "severity": "high"},
            {"factor": "Consumer backlog", "detail": "10,000+ unprocessed messages", "severity": "high"},
        ],
        "affected_services": ["Kafka", "Order Service", "Notification Service"],
        "assigned_to": "Sarah Chen",
    },
    {
        "id": "inc-003",
        "org_id": ORG_ID,
        "incident_number": "INC-2024-00121",
        "title": "Memory Leak in Search Service",
        "description": "Search Service pods showing steadily increasing memory consumption, approaching OOM kill threshold.",
        "severity": "medium",
        "status": "monitoring",
        "service_name": "Search Service",
        "environment": "production",
        "started_at": now - timedelta(hours=4),
        "identified_at": now - timedelta(hours=3),
        "mttr_seconds": None,
        "ai_summary": "Memory leak traced to unclosed MongoDB cursor connections in the search indexing pipeline. Each query allocates ~2MB that is not released.",
        "root_cause": "Unclosed MongoDB cursor objects in search indexing batch process.",
        "confidence_score": 78.0,
        "contributing_factors": [
            {"factor": "Memory growth", "detail": "+15MB/hour per pod", "severity": "medium"},
            {"factor": "Cursor leak", "detail": "MongoDB cursors not closed in batch indexer", "severity": "high"},
        ],
        "affected_services": ["Search Service"],
        "assigned_to": "Marcus Johnson",
    },
    {
        "id": "inc-004",
        "org_id": ORG_ID,
        "incident_number": "INC-2024-00120",
        "title": "Staging Deployment Pipeline Failure",
        "description": "CI/CD pipeline for staging environment failing at integration test stage.",
        "severity": "low",
        "status": "resolved",
        "service_name": "Web Frontend",
        "environment": "staging",
        "started_at": now - timedelta(days=1, hours=2),
        "identified_at": now - timedelta(days=1, hours=1, minutes=30),
        "resolved_at": now - timedelta(days=1),
        "mttr_seconds": 7200,
        "ai_summary": "Pipeline failure caused by expired test database credentials in the staging Kubernetes secret.",
        "root_cause": "Expired database credentials in staging k8s secret 'staging-db-creds'.",
        "confidence_score": 98.0,
        "contributing_factors": [
            {"factor": "Expired secret", "detail": "staging-db-creds expired 2 hours before failure", "severity": "medium"},
        ],
        "affected_services": ["Web Frontend"],
        "assigned_to": "Alex Rivera",
    },
    {
        "id": "inc-005",
        "org_id": ORG_ID,
        "incident_number": "INC-2024-00119",
        "title": "Authentication Service Rate Limiting",
        "description": "Auth service hitting rate limits causing intermittent login failures for ~2% of users.",
        "severity": "medium",
        "status": "resolved",
        "service_name": "Auth Service",
        "environment": "production",
        "started_at": now - timedelta(days=2, hours=5),
        "identified_at": now - timedelta(days=2, hours=4),
        "resolved_at": now - timedelta(days=2, hours=3),
        "mttr_seconds": 7200,
        "ai_summary": "Redis-backed rate limiter had an incorrect TTL configuration causing token bucket to fill up too quickly during peak traffic.",
        "root_cause": "Rate limiter TTL misconfiguration: set to 10s instead of 60s.",
        "confidence_score": 95.0,
        "contributing_factors": [
            {"factor": "Config error", "detail": "Rate limit window 10s instead of 60s", "severity": "high"},
            {"factor": "Peak traffic", "detail": "Monday morning login surge +180%", "severity": "medium"},
        ],
        "affected_services": ["Auth Service", "Web Frontend", "Mobile API"],
        "assigned_to": "Sarah Chen",
    },
]

# ── Deployments ───────────────────────────────────────────
DEPLOYMENTS = [
    {"id": "deploy-001", "service_id": SVC_IDS["api_gateway"], "version": "v2.4.1", "status": "success", "deployed_by": "Sarah Chen", "commit_sha": "a3f2c8d", "environment": "production", "deployed_at": now - timedelta(hours=2)},
    {"id": "deploy-002", "service_id": SVC_IDS["web_frontend"], "version": "v3.1.0", "status": "success", "deployed_by": "Marcus Johnson", "commit_sha": "b7e4f1a", "environment": "production", "deployed_at": now - timedelta(hours=6)},
    {"id": "deploy-003", "service_id": SVC_IDS["payment_service"], "version": "v2.0.4", "status": "success", "deployed_by": "Sarah Chen", "commit_sha": "c1d5e9f", "environment": "production", "deployed_at": now - timedelta(days=1)},
    {"id": "deploy-004", "service_id": SVC_IDS["api_gateway"], "version": "v2.4.2", "status": "rolling", "deployed_by": "CI/CD", "commit_sha": "d8a3b2c", "environment": "staging", "deployed_at": now - timedelta(minutes=30)},
    {"id": "deploy-005", "service_id": SVC_IDS["search_service"], "version": "v2.1.1", "status": "failed", "deployed_by": "Marcus Johnson", "commit_sha": "e5f7g8h", "environment": "staging", "deployed_at": now - timedelta(hours=6)},
    {"id": "deploy-006", "service_id": SVC_IDS["order_service"], "version": "v1.5.2", "status": "pending", "deployed_by": "CI/CD", "commit_sha": "f2g4h6i", "environment": "dev", "deployed_at": now - timedelta(minutes=5)},
]

# ── Runbooks ──────────────────────────────────────────────
RUNBOOKS = [
    {
        "id": "rb-001", "org_id": ORG_ID, "name": "High CPU Usage Resolution",
        "description": "Automatically restarts service pods when CPU usage exceeds 90% for more than 5 minutes.",
        "script": "#!/bin/bash\nkubectl rollout restart deployment/$SERVICE_NAME -n $NAMESPACE\nkubectl rollout status deployment/$SERVICE_NAME -n $NAMESPACE --timeout=120s\necho \"Service $SERVICE_NAME restarted successfully\"",
        "trigger": "cpu_usage > 90%", "category": "performance", "is_active": True, "requires_approval": False,
        "execution_count": 12,
    },
    {
        "id": "rb-002", "org_id": ORG_ID, "name": "Pod CrashLoop Recovery",
        "description": "Recovers pods stuck in CrashLoopBackOff by deleting and allowing the ReplicaSet to recreate them.",
        "script": "#!/bin/bash\nkubectl delete pod $POD_NAME -n $NAMESPACE --grace-period=30\nsleep 10\nkubectl get pods -n $NAMESPACE -l app=$SERVICE_NAME\necho \"Pod recovery initiated for $POD_NAME\"",
        "trigger": "pod_restart_count > 5", "category": "recovery", "is_active": True, "requires_approval": True,
        "execution_count": 8,
    },
    {
        "id": "rb-003", "org_id": ORG_ID, "name": "Database Connection Issues",
        "description": "Fixes database connectivity problems by recycling connection pool and verifying connectivity.",
        "script": "#!/bin/bash\nkubectl exec -it $DB_POD -n $NAMESPACE -- psql -U postgres -c \"SELECT count(*) FROM pg_stat_activity;\"\nkubectl rollout restart deployment/$SERVICE_NAME -n $NAMESPACE\necho \"Connection pool recycled for $SERVICE_NAME\"",
        "trigger": "db_connection_errors > 10", "category": "database", "is_active": True, "requires_approval": True,
        "execution_count": 5,
    },
    {
        "id": "rb-004", "org_id": ORG_ID, "name": "Disk Space Cleanup",
        "description": "Cleans up old logs and temporary files when disk usage exceeds 80%.",
        "script": "#!/bin/bash\nfind /var/log -name '*.log' -mtime +7 -delete\nfind /tmp -mtime +3 -delete\ndf -h\necho \"Disk cleanup completed\"",
        "trigger": "disk_usage > 80%", "category": "maintenance", "is_active": True, "requires_approval": False,
        "execution_count": 22,
    },
    {
        "id": "rb-005", "org_id": ORG_ID, "name": "Scale Deployment",
        "description": "Horizontally scales a deployment when request rate exceeds threshold.",
        "script": "#!/bin/bash\nCURRENT=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.spec.replicas}')\nNEW=$((CURRENT + 2))\nkubectl scale deployment/$SERVICE_NAME -n $NAMESPACE --replicas=$NEW\necho \"Scaled $SERVICE_NAME from $CURRENT to $NEW replicas\"",
        "trigger": "request_rate > 5000", "category": "scaling", "is_active": True, "requires_approval": True,
        "execution_count": 15,
    },
    {
        "id": "rb-006", "org_id": ORG_ID, "name": "Rollback Deployment",
        "description": "Rolls back a deployment to the previous stable version.",
        "script": "#!/bin/bash\nkubectl rollout undo deployment/$SERVICE_NAME -n $NAMESPACE\nkubectl rollout status deployment/$SERVICE_NAME -n $NAMESPACE --timeout=180s\nNEW_VERSION=$(kubectl get deployment $SERVICE_NAME -n $NAMESPACE -o jsonpath='{.metadata.labels.version}')\necho \"Rolled back $SERVICE_NAME to $NEW_VERSION\"",
        "trigger": "error_rate > 5%", "category": "deployment", "is_active": True, "requires_approval": True,
        "execution_count": 3,
    },
    {
        "id": "rb-007", "org_id": ORG_ID, "name": "SSL Certificate Renewal",
        "description": "Renews SSL/TLS certificates using cert-manager and restarts ingress.",
        "script": "#!/bin/bash\nkubectl delete certificate $CERT_NAME -n $NAMESPACE\nkubectl apply -f /etc/certs/$CERT_NAME.yaml\nsleep 30\nkubectl get certificate $CERT_NAME -n $NAMESPACE\necho \"Certificate $CERT_NAME renewed\"",
        "trigger": "cert_expiry < 7d", "category": "security", "is_active": True, "requires_approval": True,
        "execution_count": 2,
    },
    {
        "id": "rb-008", "org_id": ORG_ID, "name": "Kafka Consumer Reset",
        "description": "Resets Kafka consumer group offset to latest when consumer lag exceeds threshold.",
        "script": "#!/bin/bash\nkubectl exec -it kafka-0 -n $NAMESPACE -- kafka-consumer-groups.sh --bootstrap-server localhost:9092 --group $CONSUMER_GROUP --reset-offsets --to-latest --execute --topic $TOPIC\necho \"Consumer group $CONSUMER_GROUP reset to latest\"",
        "trigger": "consumer_lag > 50000", "category": "messaging", "is_active": True, "requires_approval": True,
        "execution_count": 4,
    },
]

# ── Cost Items ────────────────────────────────────────────
COST_ITEMS = [
    {"id": "cost-001", "org_id": ORG_ID, "resource_type": "compute", "resource_name": "Idle EC2 Instances (3x m5.xlarge)", "monthly_cost": 1240.0, "waste_type": "idle", "potential_savings": 1240.0, "region": "us-east-1", "details": "Three m5.xlarge instances with <5% CPU utilization for 30+ days"},
    {"id": "cost-002", "org_id": ORG_ID, "resource_type": "storage", "resource_name": "Unused EBS Volumes", "monthly_cost": 890.0, "waste_type": "unused", "potential_savings": 890.0, "region": "us-east-1", "details": "12 unattached EBS volumes totaling 8TB"},
    {"id": "cost-003", "org_id": ORG_ID, "resource_type": "database", "resource_name": "Overprovisioned RDS Instance", "monthly_cost": 670.0, "waste_type": "overprovisioned", "potential_savings": 335.0, "region": "us-east-1", "details": "db.r5.2xlarge could be downsized to db.r5.xlarge based on usage patterns"},
    {"id": "cost-004", "org_id": ORG_ID, "resource_type": "network", "resource_name": "Overprovisioned NAT Gateways", "monthly_cost": 410.0, "waste_type": "overprovisioned", "potential_savings": 205.0, "region": "us-west-2", "details": "3 NAT Gateways where 1 would suffice for staging environment"},
    {"id": "cost-005", "org_id": ORG_ID, "resource_type": "compute", "resource_name": "Unused Load Balancers", "monthly_cost": 410.0, "waste_type": "unused", "potential_savings": 410.0, "region": "us-east-1", "details": "4 ALBs with zero registered targets for 15+ days"},
    {"id": "cost-006", "org_id": ORG_ID, "resource_type": "compute", "resource_name": "Production Compute (EKS)", "monthly_cost": 11043.0, "waste_type": None, "potential_savings": 0.0, "region": "us-east-1", "details": "Primary production EKS cluster compute costs"},
    {"id": "cost-007", "org_id": ORG_ID, "resource_type": "storage", "resource_name": "S3 + EBS Active Storage", "monthly_cost": 4782.0, "waste_type": None, "potential_savings": 0.0, "region": "us-east-1", "details": "Active storage across S3 buckets and attached EBS volumes"},
    {"id": "cost-008", "org_id": ORG_ID, "resource_type": "database", "resource_name": "RDS + ElastiCache", "monthly_cost": 3827.0, "waste_type": None, "potential_savings": 0.0, "region": "us-east-1", "details": "PostgreSQL RDS and Redis ElastiCache clusters"},
    {"id": "cost-009", "org_id": ORG_ID, "resource_type": "network", "resource_name": "Data Transfer + CDN", "monthly_cost": 2436.0, "waste_type": None, "potential_savings": 0.0, "region": "global", "details": "CloudFront CDN and inter-region data transfer"},
    {"id": "cost-010", "org_id": ORG_ID, "resource_type": "other", "resource_name": "Other Services", "monthly_cost": 2352.0, "waste_type": None, "potential_savings": 0.0, "region": "us-east-1", "details": "Lambda, SQS, SNS, CloudWatch, and miscellaneous services"},
]

# ── Security Findings ─────────────────────────────────────
SECURITY_FINDINGS = [
    {"id": "sec-001", "org_id": ORG_ID, "severity": "high", "category": "exposed_port", "resource": "k8s-node-3:22", "description": "SSH port 22 exposed to 0.0.0.0/0 on production node", "remediation": "Restrict SSH access to VPN CIDR range only", "status": "open"},
    {"id": "sec-002", "org_id": ORG_ID, "severity": "high", "category": "exposed_port", "resource": "k8s-node-1:6379", "description": "Redis port 6379 accessible from outside cluster network", "remediation": "Apply NetworkPolicy to restrict Redis access to application pods only", "status": "open"},
    {"id": "sec-003", "org_id": ORG_ID, "severity": "high", "category": "exposed_port", "resource": "api-gateway:8080", "description": "Admin debug endpoint exposed on production API Gateway", "remediation": "Disable debug endpoint or restrict to internal network", "status": "open"},
    {"id": "sec-004", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "payment-service:v2.0.4", "description": "Base image contains 3 high-severity CVEs (CVE-2024-1234, CVE-2024-1235, CVE-2024-1236)", "remediation": "Update base image to node:20-alpine3.19", "status": "open", "cve_id": "CVE-2024-1234"},
    {"id": "sec-005", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "auth-service:v1.8.2", "description": "OpenSSL vulnerability in base image", "remediation": "Rebuild with patched OpenSSL 3.2.1", "status": "open", "cve_id": "CVE-2024-2567"},
    {"id": "sec-006", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "order-service:v1.5.1", "description": "Vulnerable log4j dependency detected", "remediation": "Update log4j to 2.21.0+", "status": "open", "cve_id": "CVE-2024-3891"},
    {"id": "sec-007", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "search-service:v2.1.0", "description": "Outdated Python requests library with known SSRF vulnerability", "remediation": "Update requests to 2.31.0+", "status": "open"},
    {"id": "sec-008", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "analytics-service:v1.0.5", "description": "PostgreSQL client library has buffer overflow vulnerability", "remediation": "Update psycopg2 to 2.9.9+", "status": "open"},
    {"id": "sec-009", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "notification-service:v1.2.0", "description": "Kafka client library CVE affecting message parsing", "remediation": "Update confluent-kafka to 2.3.0+", "status": "open"},
    {"id": "sec-010", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "user-service:v1.3.0", "description": "bcrypt dependency has timing attack vulnerability", "remediation": "Update bcryptjs to 2.4.4+", "status": "mitigated"},
    {"id": "sec-011", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "mobile-api:v1.9.0", "description": "Express.js framework has prototype pollution vulnerability", "remediation": "Update express to 4.19.2+", "status": "open"},
    {"id": "sec-012", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "web-frontend:v3.1.0", "description": "React DOM XSS vulnerability in dangerouslySetInnerHTML usage", "remediation": "Sanitize HTML input with DOMPurify", "status": "open"},
    {"id": "sec-013", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "api-gateway:v2.4.1", "description": "NGINX ingress controller has HTTP/2 rapid reset vulnerability", "remediation": "Update ingress-nginx to 1.9.5+", "status": "open"},
    {"id": "sec-014", "org_id": ORG_ID, "severity": "medium", "category": "vulnerable_image", "resource": "redis:7.2", "description": "Redis ACL bypass vulnerability in cluster mode", "remediation": "Update Redis to 7.2.4+", "status": "open"},
    {"id": "sec-015", "org_id": ORG_ID, "severity": "medium", "category": "weak_iam", "resource": "eks-node-role", "description": "EKS node IAM role has overly permissive S3 access (s3:*)", "remediation": "Restrict to specific S3 buckets with least-privilege policy", "status": "open"},
    {"id": "sec-016", "org_id": ORG_ID, "severity": "medium", "category": "weak_iam", "resource": "ci-cd-role", "description": "CI/CD pipeline role has AdministratorAccess policy attached", "remediation": "Create custom policy with minimum required permissions", "status": "open"},
    {"id": "sec-017", "org_id": ORG_ID, "severity": "medium", "category": "weak_iam", "resource": "lambda-exec-role", "description": "Lambda execution role allows ec2:* actions", "remediation": "Scope down to specific EC2 actions needed", "status": "open"},
    {"id": "sec-018", "org_id": ORG_ID, "severity": "medium", "category": "weak_iam", "resource": "dev-team-role", "description": "Development team role has production database write access", "remediation": "Remove production write permissions from dev role", "status": "open"},
    {"id": "sec-019", "org_id": ORG_ID, "severity": "medium", "category": "weak_iam", "resource": "monitoring-role", "description": "Monitoring role has unnecessary secrets manager read access", "remediation": "Remove SecretsManagerReadWrite from monitoring role", "status": "open"},
    {"id": "sec-020", "org_id": ORG_ID, "severity": "high", "category": "secret_exposure", "resource": "payment-service/config.yaml", "description": "Stripe API key found in plaintext configuration file", "remediation": "Move secret to AWS Secrets Manager and reference via environment variable", "status": "open"},
    {"id": "sec-021", "org_id": ORG_ID, "severity": "high", "category": "secret_exposure", "resource": "staging/.env", "description": "Database credentials committed in .env file in staging branch", "remediation": "Remove from git history, rotate credentials, use sealed secrets", "status": "open"},
    {"id": "sec-022", "org_id": ORG_ID, "severity": "low", "category": "vulnerable_image", "resource": "Various", "description": "5 container images using deprecated base OS versions", "remediation": "Migrate to current LTS base images", "status": "open"},
    {"id": "sec-023", "org_id": ORG_ID, "severity": "low", "category": "weak_iam", "resource": "s3-bucket-policy", "description": "Staging S3 bucket allows public list operations", "remediation": "Remove public access and enable S3 Block Public Access", "status": "open"},
    {"id": "sec-024", "org_id": ORG_ID, "severity": "low", "category": "weak_iam", "resource": "cloudwatch-logs", "description": "CloudWatch log group missing encryption configuration", "remediation": "Enable KMS encryption for log groups", "status": "open"},
]

# ── Integrations ──────────────────────────────────────────
INTEGRATIONS = [
    {"id": "intg-001", "org_id": ORG_ID, "type": "prometheus", "name": "Prometheus (Production)", "status": "connected", "is_active": True},
    {"id": "intg-002", "org_id": ORG_ID, "type": "grafana", "name": "Grafana Cloud", "status": "connected", "is_active": True},
    {"id": "intg-003", "org_id": ORG_ID, "type": "slack", "name": "Slack (#incidents)", "status": "connected", "is_active": True},
    {"id": "intg-004", "org_id": ORG_ID, "type": "pagerduty", "name": "PagerDuty", "status": "connected", "is_active": True},
    {"id": "intg-005", "org_id": ORG_ID, "type": "github", "name": "GitHub (acme-corp)", "status": "connected", "is_active": True},
    {"id": "intg-006", "org_id": ORG_ID, "type": "datadog", "name": "Datadog APM", "status": "connected", "is_active": True},
    {"id": "intg-007", "org_id": ORG_ID, "type": "aws", "name": "AWS (Production)", "status": "connected", "is_active": True},
    {"id": "intg-008", "org_id": ORG_ID, "type": "kubernetes", "name": "EKS Cluster", "status": "connected", "is_active": True},
]

# ── Simulation Scenarios ──────────────────────────────────
SIMULATIONS = [
    {
        "id": "sim-001", "org_id": ORG_ID, "scenario_type": "Pod Failure",
        "target_resource": "payment-service-7d8f4b8d5-xyr12",
        "parameters_json": {"pods_to_fail": 1, "traffic_load": 100, "duration": "15 minutes"},
        "result_json": {
            "blast_radius": "Low Risk — Only 2 users may be affected",
            "error_rate_increase": "0.12%",
            "response_time_impact": "45ms",
            "affected_users": "~2",
            "availability_impact": "99.98%",
            "recommendation": "The system can handle this failure with minimal impact. No action required.",
        },
        "risk_score": 12.0, "blast_radius": "Low Risk", "status": "completed", "created_by": "Sarah Chen",
    },
    {
        "id": "sim-002", "org_id": ORG_ID, "scenario_type": "Node Failure",
        "target_resource": "k8s-node-3",
        "parameters_json": {"node_count": 1, "drain_timeout": "5m"},
        "result_json": {
            "blast_radius": "Medium Risk — 8 pods will be rescheduled",
            "error_rate_increase": "2.5%",
            "response_time_impact": "350ms during reschedule",
            "affected_users": "~150",
            "availability_impact": "99.2%",
            "recommendation": "Pre-scale other nodes before draining. Consider cordoning first.",
        },
        "risk_score": 45.0, "blast_radius": "Medium Risk", "status": "completed", "created_by": "Marcus Johnson",
    },
    {
        "id": "sim-003", "org_id": ORG_ID, "scenario_type": "Traffic Spike",
        "target_resource": "API Gateway",
        "parameters_json": {"multiplier": 5, "duration": "30 minutes", "ramp_time": "2 minutes"},
        "result_json": {
            "blast_radius": "High Risk — System may become unstable",
            "error_rate_increase": "15%",
            "response_time_impact": "2500ms",
            "affected_users": "~5000",
            "availability_impact": "94.5%",
            "recommendation": "Auto-scaling needed. Current HPA max is insufficient. Increase to 20 replicas.",
        },
        "risk_score": 78.0, "blast_radius": "High Risk", "status": "completed", "created_by": "Sarah Chen",
    },
]


async def seed_database(session):
    """Seed the database with demo data."""
    from app.models.user import Organization, User
    from app.models.asset import Cluster, Node, Service, Pod, Deployment, DependencyEdge
    from app.models.incident import (
        Alert, Incident, Runbook, CostItem, SecurityFinding,
        SimulationScenario, RemediationAction
    )
    from app.models.integration import Integration
    from sqlalchemy import select

    # Check if data already exists
    result = await session.execute(select(Organization).limit(1))
    if result.scalar_one_or_none():
        return False

    # Seed organizations
    for org_data in ORGANIZATIONS:
        session.add(Organization(**org_data))

    # Seed users
    for user_data in USERS:
        session.add(User(**user_data))

    # Seed clusters
    for cluster_data in CLUSTERS:
        session.add(Cluster(**cluster_data))

    # Seed nodes
    for node_data in NODES:
        session.add(Node(**node_data))

    # Seed services
    for svc_data in SERVICES:
        session.add(Service(**svc_data))

    # Seed pods
    for pod_data in PODS:
        session.add(Pod(**pod_data))

    # Seed dependency edges
    for edge_data in DEPENDENCY_EDGES:
        session.add(DependencyEdge(**edge_data))

    # Seed deployments
    for deploy_data in DEPLOYMENTS:
        session.add(Deployment(**deploy_data))

    # Seed alerts
    for alert_data in ALERTS:
        session.add(Alert(**alert_data))

    # Seed incidents
    for inc_data in INCIDENTS:
        session.add(Incident(**inc_data))

    # Seed runbooks
    for rb_data in RUNBOOKS:
        session.add(Runbook(**rb_data))

    # Seed cost items
    for cost_data in COST_ITEMS:
        session.add(CostItem(**cost_data))

    # Seed security findings
    for sec_data in SECURITY_FINDINGS:
        session.add(SecurityFinding(**sec_data))

    # Seed integrations
    for intg_data in INTEGRATIONS:
        session.add(Integration(**intg_data))

    # Seed simulations
    for sim_data in SIMULATIONS:
        session.add(SimulationScenario(**sim_data))

    await session.commit()
    return True
