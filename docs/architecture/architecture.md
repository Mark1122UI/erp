# Universal ERP / Business Operating System — System Architecture

## 1. Executive Summary & Vision

The **Universal ERP / Business Operating System (UE-BOS)** is a modern, modular, multi-tenant enterprise resource planning platform. Its primary objective is to provide a rock-solid, industry-agnostic **Universal Core** while seamlessly supporting specialized **Industry Modules**.

The platform is designed to scale across multiple vertical industries:
- **Phase 1 Target**: Retail & E-Commerce (Omnichannel POS, Catalog Matrix, Multi-Warehouse Inventory, Order Management System, E-Commerce Integrations).
- **Future Verticals**: Manufacturing, Logistics & Supply Chain, Healthcare, Construction & Contracting, Professional Services.

```
+---------------------------------------------------------------------------------------+
|                                    CLIENT LAYER                                       |
|  [ Web Admin (React/Next.js) ]  [ POS App (PWA/Offline) ]  [ E-Commerce Storefront ]  |
|  [ Mobile Field App (Capacitor/React Native) ]  [ Barcode / Hardware Peripheral APIs ] |
+---------------------------------------------------------------------------------------+
                                           | (HTTPS / WSS / REST / Webhooks)
+---------------------------------------------------------------------------------------+
|                               API GATEWAY & EDGE LAYER                                |
|  - Tenant Resolver & Subdomain Router       - Rate Limiting & DDoS Shield             |
|  - JWT Authentication & Session Validation  - Request Idempotency & Tracing           |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
|                             UNIVERSAL CORE PLATFORM                                   |
|  +-------------------------+  +--------------------------+  +----------------------+  |
|  | Tenant & Org Hierarchy  |  | Multi-Entity Accounting  |  | Core Inventory & UOM |  |
|  | (Tenants, Branches)     |  | (Double-Entry Ledger)    |  | (Batches, Serialized)|  |
|  +-------------------------+  +--------------------------+  +----------------------+  |
|  +-------------------------+  +--------------------------+  +----------------------+  |
|  | RBAC / ABAC Security    |  | Universal CRM & Parties  |  | Universal Workflows  |  |
|  | (Roles, Permissions)    |  | (Customers, Suppliers)   |  | (Approvals, Events)  |  |
|  +-------------------------+  +--------------------------+  +----------------------+  |
|  +-------------------------+  +--------------------------+  +----------------------+  |
|  | Audit Log & Compliance  |  | Event Bus & Webhooks     |  | Document & Media Hub |  |
|  | (Immutable Streams)     |  | (Outbox Pattern)         |  | (S3/MinIO Engine)    |  |
|  +-------------------------+  +--------------------------+  +----------------------+  |
+---------------------------------------------------------------------------------------+
                                           |
                     Plugin / Extension Interface (Lifecycle Hooks)
                                           |
+---------------------------------------------------------------------------------------+
|                                INDUSTRY MODULES LAYER                                 |
|                                                                                       |
|  [ ACTIVE: RETAIL & E-COMMERCE MODULE ]                                               |
|  - POS Register & Cashier Shifts             - Omnichannel Order Orchestration        |
|  - Matrix Variants (Size/Color/Fit)          - Barcode Labeling (EAN/UPC/Code128)     |
|  - Dynamic Promotion & Discount Engine       - Cart & Checkout Subsystem              |
|  - E-Commerce Storefront Engine / Webhooks   - Courier & Fulfillment Dispatch         |
|                                                                                       |
|  [ FUTURE PLUGINS ]                                                                   |
|  - Healthcare (EHR, Appointments, Pharmacy) - Manufacturing (BOM, Work Centers, MRP)  |
|  - Construction (Projects, Milestones, Bidding)- Logistics (Fleet, Routing, Dispatch)  |
|  - Professional Services (Timesheets, SLA, Billing)                                   |
+---------------------------------------------------------------------------------------+
                                           |
+---------------------------------------------------------------------------------------+
|                              DATA & PERSISTENCE LAYER                                 |
|  - Primary Store: MongoDB Replica Set (Native Driver / Mongoose ODM)                  |
|    * Discriminator-based polymorphic extensions                                       |
|    * Multi-tenant data partition (tenantId index key on every collection)             |
|    * ACID Distributed Transactions for Financials & Stock Movements                   |
|  - Cache & Ephemeral Store: Redis (Sessions, Rate-Limits, Real-time Stock Buffers)     |
|  - Object Storage: S3 / MinIO (Invoices, Receipts, Media, Documents)                  |
+---------------------------------------------------------------------------------------+
```

---

## 2. Core vs Industry Separation Principles

To prevent domain contamination and technical debt, the architecture enforces strict boundaries between the **Universal Core** and **Industry Modules**:

### A. The Core Invariants
1. **Industry Agnostic**: The Universal Core never references retail, medical, construction, or manufacturing concepts directly.
2. **Abstract Primitives**: The Core defines abstract entities:
   - `Party`: Base entity for Customers, Suppliers, Patients, Subcontractors, Employees.
   - `Item`: Base entity for Products, SKU variants, Medical Supplies, Building Materials, Billable Services.
   - `LedgerTransaction`: Base double-entry accounting unit for Sales Invoices, POS Receipts, Project Claims, Hospital Bills.
   - `StockMovement`: Base inventory transfer unit between Locations/Bins with FIFO/LIFO/Weighted Average valuation.
   - `WorkflowInstance`: Base state machine for Order Approvals, PO approvals, Medical charts, Project milestones.
3. **Extension Mechanisms**:
   - **Schema Extensions**: MongoDB flexible schema attributes (`customFields`, `metadata`, discriminator models).
   - **Lifecycle Hooks / Middleware**: Plugin hooks before/after core actions (`beforeStockDeduction`, `afterOrderPaid`, `onPartyCreated`).
   - **Event Bus Pub/Sub**: Asynchronous domain events (`order.placed`, `payment.reconciled`, `inventory.threshold_breached`).

```
+-----------------------------------------------------------------------------+
|                               EXTENSION HOOK FLOW                           |
|                                                                             |
|   [POS Checkout Request]                                                    |
|            │                                                                |
|            ▼                                                                |
|   [Retail Module Controller]                                                |
|            │                                                                |
|            ├──> 1. Calculate Promotions & Tax (Retail Plugin Hook)          |
|            ├──> 2. Validate Cashier Shift Status (Retail Plugin Hook)       |
|            │                                                                |
|            ▼                                                                |
|   [Universal Core: Ledger Service] ────> Records ACID Journal Entries       |
|            │                                                                |
|            ▼                                                                |
|   [Universal Core: Inventory Service] ──> Deducts Batch/Serial Stock        |
|            │                                                                |
|            ▼                                                                |
|   [Universal Core: Outbox Service] ────> Emits "inventory.depleted" Event  |
|            │                                                                |
|            ▼                                                                |
|   [E-Commerce Sync Consumer] ──────────> Updates Shopify / Web Storefront  |
+-----------------------------------------------------------------------------+
```

---

## 3. High-Level Architecture Components

### 3.1 Frontend Architecture
- **Admin & Backoffice Web App**: Built with Next.js / React, utilizing a component-driven design system with responsive layouts, dark/light theme tokens, and data-dense enterprise tables.
- **Point of Sale (POS) Web Client**: Offline-capable Progressive Web Application (PWA) with client-side IndexedDB cache, background sync service workers, keyboard navigation shortcuts, and WebUSB/WebSerial/Bluetooth thermal printer and barcode scanner hardware support.
- **Customer E-Commerce Storefront**: Headless, edge-rendered storefront communicating via authenticated REST / GraphQL endpoints.

### 3.2 Backend & Micro-Kernel Architecture
- **Modular Monolith Architecture**: High-cohesion, loosely-coupled modules packaged into a clean monolithic service layer for maximum developer velocity and zero distributed-transaction overhead, while designed with strict domain boundaries to allow extracting microservices if scale dictates.
- **Node.js / TypeScript Runtime**: Type-safe domain models, DTOs, controllers, and services.
- **Dependency Injection & Lifecycle Management**: Modules declare their routes, schemas, hooks, and background workers during application boot.

### 3.3 Persistence & Storage Strategy
- **MongoDB 6.0+ (Replica Set)**: Primary ACID transactional data store.
  - Multi-document transactions used exclusively for financial journal balancing, inventory reservations, and checkout reconciliation.
  - Collation-aware, compound indexed collections with mandatory `tenantId` sharding prefix.
- **Redis (Cluster/Sentinel)**: Distributed locks (Redlock) for stock reservations, real-time POS session caching, and WebSocket pub/sub.
- **S3-Compatible Object Store**: Immutable storage for digital receipts, invoices (PDF), product media, and export files.

---

## 4. Multi-Tenancy Architecture

The ERP implements a **Logical Partitioning Multi-Tenant Architecture** on a shared MongoDB database cluster:

### 4.1 Tenant Hierarchy
```
Tenant (Root Subscription / Company Group)
  └── Organization (Legal Entity / Subsidiary)
        └── Branch / Warehouse / Retail Store
              └── POS Terminals / Cash Registers / Bins
```

### 4.2 Isolation & Data Safety Invariants
1. **Mandatory Tenant Scoping**: Every database schema has `{ tenantId: { type: Schema.Types.ObjectId, required: true, index: true } }`.
2. **Context Propagation (AsyncLocalStorage)**: The authenticated `tenantId`, `userId`, `organizationId`, and `branchId` are extracted at the API gateway layer and stored in Node.js `AsyncLocalStorage`.
3. **Mongoose Query Middleware**: Global pre-find, pre-update, and pre-aggregate middleware automatically injects `{ tenantId: currentTenantId }` to eliminate cross-tenant data leaks.
4. **Audit Logging**: Any query executed without a valid tenant context is intercepted and logged as a high-severity security alert.

---

## 5. Offline & PWA Sync Architecture (POS)

The Retail POS requires continuous operation even during internet outages:

```
+------------------------------------------------------------------------------+
|                         POS CLIENT (OFFLINE-FIRST)                           |
|                                                                              |
|  [Barcode Scan / Cart Action]                                                |
|             │                                                                |
|             ▼                                                                |
|  [Local IndexedDB (Dexie.js)]                                                |
|   - Cached Products & Barcodes (Snapshot)                                    |
|   - Local Customer Cache                                                     |
|   - Offline Transaction Queue (UUID, Status: 'PENDING_SYNC')                 |
|             │                                                                |
|             ▼                                                                |
|  [Background Sync Service Worker]                                            |
|             │ (When Online)                                                  |
|             ▼                                                                |
|  [Bulk Idempotent Sync Endpoint: POST /api/v1/pos/sync]                      |
|             │                                                                |
+─────────────┼────────────────────────────────────────────────────────────────+
              │
              ▼
+------------------------------------------------------------------------------+
|                         SERVER RECONCILIATION ENGINE                         |
|                                                                              |
|  1. Validate Idempotency UUIDs (Prevent duplicate charge/deduction)          |
|  2. Execute MongoDB ACID Transaction:                                        |
|     - Record POS Sale & Journal Entries                                      |
|     - Deduct Stock (Handle negative balance override if permitted)           |
|     - Mark Cashier Shift Totals                                              |
|  3. Return Conflict Resolutions (Price changes, out-of-stock flags)          |
+------------------------------------------------------------------------------+
```

---

## 6. Hardware & Peripheral Integration Architecture

POS operations depend on reliable hardware communication:
- **Barcode Scanners (1D/2D)**:
  - *HID Keyboard Emulation Mode*: Global keyboard event listener with debounce timer (characters typed < 50ms apart with trailing Enter) capturing barcode input without requiring user focus on an input box.
  - *Direct Web Serial/USB Mode*: Dedicated WebUSB API connection for high-throughput automated scanning stations.
- **Thermal Receipt Printers (ESC/POS)**:
  - Browser Direct: WebUSB / WebBluetooth / WebSerial API sending binary ESC/POS command buffers.
  - Network / Cloud Printers: Raw TCP socket / IP printing via local agent or WebSocket bridge.
- **Cash Drawers**: Triggered via RJ11 pulse command sent through the thermal printer (`ESC p 0 25 250`).
- **Electronic Weighing Scales**: WebSerial integration reading RS-232 continuous weight data streams for weighted items (e.g. produce, bulk goods).
- **Payment Terminals (EMV / NFC / EFTPOS)**: Integrated via cloud Webhooks or local IP/USB terminal bridge protocol.
