# Universal ERP — Operational Runbook & Maintenance Guide

This document provides operational guidelines, health check procedures, log monitoring, and routine maintenance tasks for system administrators and DevOps engineers.

---

## 1. Health Checks & Diagnostics

### Liveness Probe (Service Status)
```bash
curl -f http://localhost:3000/health
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-08-26T15:00:00.000Z",
    "uptime": 86400,
    "app": "Universal-ERP",
    "environment": "production"
  }
}
```

### Readiness Probe (Database & Infrastructure Status)
```bash
curl -f http://localhost:3000/ready
```
**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "status": "ready",
    "database": "connected",
    "timestamp": "2026-08-26T15:00:00.000Z",
    "uptime": 86400
  }
}
```

---

## 2. Log Management & Monitoring

Universal ERP outputs single-line JSON logs in production for ingestion by CloudWatch, Datadog, or Grafana Loki.

### Viewing Real-Time Logs in Docker
```bash
docker logs -f --tail=100 universal_erp_app
```

### Filtering Error Events
```bash
docker logs universal_erp_app 2>&1 | grep '"level":"ERROR"'
```

---

## 3. Routine Maintenance & Scaling

- **Restarting the Application Service**:
  ```bash
  docker compose restart app
  ```
- **Pruning Unused Docker Resources**:
  ```bash
  docker system prune -f
  ```
- **Horizontal Scaling**:
  When deploying multiple instances behind a load balancer, ensure `JWT_SECRET` and `COOKIE_SECRET` are identical across all replicas.
