# Universal ERP — Known Architectural & Scaling Boundaries

This document details known operational boundaries, design limits, and scaling recommendations for Universal ERP MVP v1.0.0.

---

## 1. Client-Side Offline Storage Limit
- **Boundary**: Offline product catalog caching is capped at **1,000 active products** in browser `localStorage`.
- **Rationale**: Prevents `QuotaExceededError` crashes on low-end Android mobile devices with constrained storage budgets (typically 5MB–10MB per origin).
- **Behavior**: If catalog exceeds 1,000 items, the top 1,000 most frequently scanned items are cached offline; remaining items are searched online via fast-path API.

---

## 2. In-Memory Rate Limiting
- **Boundary**: Default rate limiter operates using an in-memory sliding window map per Node.js process.
- **Scaling Recommendation**: In multi-instance cluster environments behind a round-robin load balancer, configure a shared Redis store for global rate limit coordination across container replicas.

---

## 3. Local File Storage
- **Boundary**: Without external S3/GCS configuration, files are written to `/app/uploads`.
- **Scaling Recommendation**: In multi-container or Kubernetes setups, mount a shared Persistent Volume (NFS / EFS) or activate the S3 storage driver.

---

## 4. Single Currency Ledger per Tenant
- **Boundary**: Base ledger transactions are recorded in the business's primary base currency (e.g. `USD`, `EUR`, `CAD`).
- **Behavior**: Multi-currency exchange rate conversions are presented on customer receipts, but underlying ledger accounts are balanced in base currency.
