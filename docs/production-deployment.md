# Universal ERP — Production Deployment Guide

This guide outlines architecture, containerization, deployment workflows, and infrastructure requirements for deploying Universal ERP to production.

---

## 1. System Architecture Overview

```
                          [ Internet Traffic ]
                                   │
                                   ▼
                    [ TLS Reverse Proxy / CDN ]
                   (Cloudflare / NGINX / AWS ALB)
                                   │
                                   ▼
         ┌──────────────────────────────────────────────────┐
         │          Docker Container / Kubernetes Pod        │
         │  Universal ERP Node.js Service (Port 3000)       │
         │  - Express REST API Engine                       │
         │  - Tenant Scoped Security & RBAC Engine          │
         │  - POS High-Speed Offline Sync Engine            │
         │  - Document Generator & Financial Ledgers        │
         └─────────────────────────┬────────────────────────┘
                                   │
                   ┌───────────────┴───────────────┐
                   ▼                               ▼
     [ MongoDB Replica Set ]            [ Shared / S3 Storage ]
   (Atlas / Managed Replica)            (/app/uploads or Cloud Bucket)
```

---

## 2. Deployment Options

### Option A: Docker Compose (Self-Hosted / Single VM / VPS)

1. Clone repository to deployment server.
2. Prepare production environment file:
   ```bash
   cp .env.example .env
   # Edit .env and supply secure secrets (JWT_SECRET, MONGODB_URI, etc.)
   ```
3. Build and launch container stack:
   ```bash
   docker compose up -d --build
   ```
4. Verify application health:
   ```bash
   curl -f http://localhost:3000/health
   curl -f http://localhost:3000/ready
   ```

### Option B: Cloud Kubernetes / AWS ECS / Google Cloud Run

1. Build container image:
   ```bash
   docker build -t your-registry/universal-erp:latest .
   docker push your-registry/universal-erp:latest
   ```
2. Configure environment secrets via Kubernetes Secrets or Cloud Secrets Manager.
3. Configure Liveness and Readiness Probes:
   - **Liveness Probe**: `GET /health` on port 3000 (Initial delay: 15s, Period: 30s)
   - **Readiness Probe**: `GET /ready` on port 3000 (Initial delay: 10s, Period: 10s)
4. Mount persistent volume for `/app/uploads` (or configure S3/Cloud Storage).

---

## 3. Reverse Proxy & SSL/TLS Configuration (NGINX Example)

```nginx
server {
    listen 80;
    server_name erp.yourdomain.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name erp.yourdomain.com;

    ssl_certificate /etc/letsencrypt/live/erp.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/erp.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 90;
    }
}
```
