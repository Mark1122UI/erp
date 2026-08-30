# Universal ERP — Pre/Post Deployment & Rollback Checklist

Use this checklist during every production release to ensure zero downtime, verified data integrity, and rapid rollback readiness.

---

## 1. Pre-Deployment Checklist

- [ ] **Database Backup**: Trigger manual logical backup archive with `mongodump` and verify archive integrity.
- [ ] **Environment Secrets Verification**:
  - `NODE_ENV=production`
  - `JWT_SECRET` is set to a 64+ char random cryptographic key.
  - `COOKIE_SECRET` is set to a 64+ char random cryptographic key.
  - `MONGODB_URI` points to a verified production replica set with TLS enabled.
  - `CORS_ORIGIN` is restricted to production domains.
- [ ] **Build Validation**:
  - `npm run build` exits with code 0 (0 TypeScript errors).
  - All automated test suites pass (25/25 suites, 100% pass rate).
- [ ] **Docker Image Tagging**: Build and tag image with semantic version (e.g. `v1.0.0`) and commit SHA.

---

## 2. Deployment Execution

- [ ] **Zero-Downtime Rolling Update**:
  - Deploy new container instances.
  - Wait for readiness probe `GET /ready` to return `200 OK` on new instances.
  - Shift traffic from old instances to new instances via reverse proxy / load balancer.
  - Terminate old container instances.

---

## 3. Post-Deployment Verification

- [ ] **Health & Readiness Check**:
  - `curl -f https://erp.yourdomain.com/health` returns `200 OK`.
  - `curl -f https://erp.yourdomain.com/ready` returns `200 OK`.
- [ ] **Smoke Test Critical Flows**:
  - [ ] User login and session cookie creation.
  - [ ] POS product search and barcode scan.
  - [ ] Cash checkout and thermal receipt generation.
  - [ ] Inventory balance reduction confirmation.
- [ ] **Log Inspection**: Inspect application logs to ensure zero unhandled 500 exceptions.

---

## 4. Rollback Procedure

If critical issues or regressions are discovered post-deployment:
1. Shift load balancer traffic back to the previous stable container image tag (e.g. `v0.9.9`).
2. If database migrations or schema incompatibilities occurred, restore the pre-deployment backup archive:
   ```bash
   mongorestore --uri="${MONGODB_URI}" --archive="/var/backups/universal_erp/pre_deploy_backup.archive.gz" --gzip --drop
   ```
3. Verify readiness on rollback instances (`GET /ready`).
4. Conduct incident post-mortem.
