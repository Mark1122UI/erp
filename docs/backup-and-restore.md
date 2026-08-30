# Universal ERP — Database Backup, Restore & Disaster Recovery Strategy

This document outlines procedures for automated backups, point-in-time recovery, disaster recovery, and verification runbooks.

---

## 1. Backup Capabilities Status Matrix

| Component | Status | Details |
| :--- | :---: | :--- |
| **CLI Backup Tools (`mongodump`)** | **IMPLEMENTED** | Standard BSON archival tool for hot logical backups. |
| **Catalog & Financial Data Exports** | **IMPLEMENTED** | Built-in `/api/v1/reports/export/*` CSV export routes for business data. |
| **Docker Compose Volume Persistence** | **CONFIGURED** | Named Docker volumes `erp_production_mongo_data` preserve state across container reboots. |
| **Automated Backup & Retention Script** | **DOCUMENTED** | Production bash script provided below for daily cron execution. |
| **Disaster Recovery Runbook** | **DOCUMENTED** | Step-by-step restoration procedures below. |
| **Cloud S3 / GCS Lifecycle Vaulting** | **NOT CONFIGURED** | Requires customer-supplied cloud credentials (AWS S3 / Google Cloud Storage bucket). |

---

## 2. Automated Daily Backup Script (`backup-mongodb.sh`)

```bash
#!/usr/bin/env bash
# ==============================================================================
# Universal ERP — Production MongoDB Logical Backup Script
# ==============================================================================
set -euo pipefail

BACKUP_DIR="/var/backups/universal_erp"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
TARGET_FILE="${BACKUP_DIR}/erp_backup_${TIMESTAMP}.archive.gz"
RETENTION_DAYS=30

mkdir -p "${BACKUP_DIR}"

echo "[$(date)] Starting MongoDB production backup..."

# Execute mongodump with gzip compression and oplog capture for point-in-time consistency
mongodump \
  --uri="${MONGODB_URI}" \
  --archive="${TARGET_FILE}" \
  --gzip \
  --oplog

echo "[$(date)] Backup completed successfully: ${TARGET_FILE}"

# Delete backups older than retention threshold
find "${BACKUP_DIR}" -type f -name "erp_backup_*.archive.gz" -mtime +${RETENTION_DAYS} -exec rm -f {} +
echo "[$(date)] Cleaned up backups older than ${RETENTION_DAYS} days."
```

---

## 3. Restore & Disaster Recovery Procedure

### Full Database Restoration

1. Ensure application traffic is temporarily suspended or routed to maintenance mode.
2. Verify target database connection and execute `mongorestore`:
   ```bash
   mongorestore \
     --uri="${TARGET_MONGODB_URI}" \
     --archive="/var/backups/universal_erp/erp_backup_YYYYMMDD_HHMMSS.archive.gz" \
     --gzip \
     --drop
   ```
3. Restart Universal ERP application container.
4. Verify readiness probe:
   ```bash
   curl -f http://localhost:3000/ready
   ```

### Backup Integrity Verification (Quarterly Runbook)

To confirm backups are restorable and uncorrupted:
1. Spin up a temporary isolated MongoDB container on staging.
2. Restore the latest production backup archive into the isolated container.
3. Run test suite against restored database to confirm all collections, indexes, and document counts match expectations.
