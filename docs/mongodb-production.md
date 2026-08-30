# Universal ERP — MongoDB Production Readiness & Index Catalog

This document details required production indexes, tenant isolation guarantees, query optimization guidelines, and replica set recommendations for MongoDB.

---

## 1. Production Indexes Specification

Every collection in Universal ERP is indexed with compound keys prefixing `tenantId` to ensure multi-tenant boundary isolation and prevent full table scans.

### Products & Catalog
- `{ tenantId: 1, sku: 1 }` (**Unique**) — Instant SKU resolution.
- `{ tenantId: 1, isArchived: 1, isActive: 1, name: 1 }` — High-speed POS catalog sorting and active filtering.
- `{ tenantId: 1, categoryId: 1 }` — Category catalog queries.
- `{ tenantId: 1, barcode: 1 }` (**Unique** on `ProductBarcode`) — Sub-millisecond scanner lookups.

### Sales & Invoicing
- `{ tenantId: 1, saleNumber: 1 }` (**Unique**) — Document number indexing.
- `{ tenantId: 1, clientReferenceId: 1 }` — Idempotent offline POS transaction deduplication.
- `{ tenantId: 1, customerId: 1, createdAt: -1 }` — Customer purchase history.
- `{ tenantId: 1, locationId: 1, createdAt: -1 }` — Store register sales reporting.

### Inventory & Stock Movements
- `{ tenantId: 1, locationId: 1, productId: 1, variantId: 1 }` (**Unique**) — Instant stock balance lookups.
- `{ tenantId: 1, productId: 1, createdAt: -1 }` — Stock movement audit trail.
- `{ tenantId: 1, locationId: 1, transactionType: 1 }` — Location movement history.

### Customers & Suppliers (Parties)
- `{ tenantId: 1, displayName: 1 }` — Autocomplete customer search.
- `{ tenantId: 1, email: 1 }` — Email lookup.
- `{ tenantId: 1, phone: 1 }` — Phone search.

### Purchasing & AP
- `{ tenantId: 1, supplierId: 1, createdAt: -1 }` — Supplier POs and bill history.
- `{ tenantId: 1, status: 1, createdAt: -1 }` — Pending bills and approval workflows.

### Audit & Security
- `{ tenantId: 1, entity: 1, entityId: 1 }` — Entity audit history.
- `{ tenantId: 1, userId: 1, createdAt: -1 }` — User action audit log.

---

## 2. Tenant Isolation Enforcement

All Mongoose queries in Universal ERP strictly enforce tenant boundaries:
1. **Never trust client IDs**: Request handlers extract `tenantId` from the verified JWT / session context via `contextProvider.getRequiredTenantId()`.
2. **Compound Filter Invariants**: Every `.find()`, `.findOne()`, `.updateOne()`, `.countDocuments()` query MUST include `{ tenantId: tenantObjectId }`.
3. **No Unanchored Wildcard Scans**: Search endpoints execute exact indexed matches before fallback patterns.

---

## 3. Recommended Production MongoDB Settings

- **Topology**: Minimum 3-node Replica Set (Primary, Secondary, Secondary) or MongoDB Atlas M10+ tier.
- **WiredTiger Cache**: Sized to 50% of available system RAM.
- **Connection Pool**: Sized to 50–100 connections per Node.js container instance.
- **Write Concern**: `w: majority, j: true` for financial, sales, and inventory mutation safety.
