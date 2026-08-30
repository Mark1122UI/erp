# Universal ERP / Business Operating System — Modular Architecture

## 1. Modular Architecture & Plugin Philosophy

The system follows a **Micro-Kernel + Plugin Architecture**.
- The **Universal Core** defines immutable enterprise business primitives and contracts.
- **Industry Modules** plug into the core via defined lifecycle hooks, event consumers, and polymorphic schema discriminators.

```
+-----------------------------------------------------------------------------------+
|                              UNIVERSAL CORE RUNTIME                               |
|                                                                                   |
|  [ Tenancy & Orgs ]  [ Auth & RBAC ]  [ Double-Entry Ledger ]  [ Core Inventory ] |
|  [ Universal CRM ]   [ Workflow Engine ]  [ Document Engine ]  [ Audit & Events ] |
+-----------------------------------------------------------------------------------+
                                         │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
+--------------------+        +--------------------+          +--------------------+
|  RETAIL + E-COMM   |        |    MANUFACTURING   |          |     HEALTHCARE     |
|     (PHASE 1)      |        |     (FUTURE)       |          |      (FUTURE)      |
|  - POS Register    |        |  - BOM Management  |          |  - EHR & Patients  |
|  - Matrix Variants |        |  - Work Centers    |          |  - Appointments    |
|  - Barcode Engine  |        |  - MRP II Routing  |          |  - Pharmacy Rx     |
|  - Omni-Orders     |        |  - Shop Floor POS  |          |  - Health Billing  |
+--------------------+        +--------------------+          +--------------------+
```

---

## 2. Universal Core Modules (Industry-Agnostic)

### 2.1 Multi-Tenant Organization & Hierarchy Engine (`@core/organization`)
- Manages multi-level structures: Tenant $\to$ Legal Entity (Company) $\to$ Branch / Warehouse.
- Handles base currency definitions, multi-currency exchange rate tables, and fiscal calendar configurations.

### 2.2 Identity & Access Control Engine (`@core/identity`)
- Multi-factor authentication, JWT token rotation, fast 4-digit POS PIN unlocking.
- Granular RBAC + ABAC policy engine checking permissions at route and service layer.

### 2.3 Double-Entry Financial Engine (`@core/financials`)
- Immutable General Ledger ensuring $\sum \text{Debits} = \sum \text{Credits}$ at all times.
- Real-time generation of Trial Balance, Profit & Loss (P&L), and Balance Sheet.
- Accounts Receivable (AR) and Accounts Payable (AP) sub-ledgers.

### 2.4 Multi-Location Inventory & Valuation Engine (`@core/inventory`)
- Real-time tracking of Stock-On-Hand, Reserved Stock, and Available Stock across branches.
- Real-time cost calculation using Weighted Average Cost and FIFO methods.
- Stock adjustments, branch-to-branch transfer requisitions, and dispatch tracking.
- Universal serial number and lot/batch tracking with expiration management.

### 2.5 Universal Party & CRM Engine (`@core/parties`)
- Universal `Party` entity supporting multi-role classification (Customer, Vendor, Contractor, Doctor, Patient).
- Credit limits, terms of payment, billing/shipping addresses, and tax exemption certificates.

### 2.6 Workflow & State Machine Engine (`@core/workflow`)
- Configurable approval hierarchies (e.g. Purchase Orders $> \$5,000$ require CFO approval).
- Status lifecycle tracking for documents with linear and branching transitions.

### 2.7 Document & Asset Hub (`@core/documents`)
- S3/MinIO cloud storage abstraction for invoices, receipts, proof of delivery, and product images.
- Automated PDF invoice and thermal receipt generation.

### 2.8 Audit & Event Outbox Engine (`@core/audit`)
- Immutable transactional audit logging capturing every entity creation, modification, and deletion.
- Transactional Outbox pattern guaranteeing reliable event publishing to Kafka/RabbitMQ/Redis.

---

## 3. Retail & E-Commerce Module (Phase 1 Target)

### 3.1 Point of Sale (POS) Subsystem
- **Register & Shift Management**: Opening float, cash in/out drawer drops, shift reconciliation, end-of-day X/Z reports.
- **Cart & Fast Checkout**: Barcode scanning with instant SKU resolution, line item discounts, customizable quick-keys grid.
- **Split & Multi-Tender Payments**: Cash, Credit/Debit card (Stripe terminal), QR payments, store credits, and gift cards.
- **Suspended Carts & Parked Bills**: Ability to park a customer's transaction and resume on another terminal.
- **Offline Mode**: IndexedDB local cart cache with automatic idempotent sync when connection is restored.

### 3.2 Matrix Variants & Barcode Engine
- **Variant Matrix**: Single parent item with infinite combinations of attributes (Color $\times$ Size $\times$ Fit).
- **Universal Barcode Resolver**: Supports EAN-13, UPC-A, Code-128, GS1-128, and QR codes.
- **Dynamic Barcode Label Printer**: PDF label layout generation for thermal label printers (Zebra, TSC, Brother).

### 3.3 Dynamic Pricing & Promotions Subsystem
- **Promotion Rules**: Buy One Get One (BOGO), percentage discounts, tier-based volume discounts, cart-level threshold discounts.
- **Customer Group Pricing**: Wholesale vs Retail vs VIP tier pricing.

### 3.4 Omnichannel Order Management (OMS)
- Unified order inbox consolidating orders from POS, Web Storefront, Mobile App, and 3rd-party channels (Shopify, Amazon).
- Real-time inventory reservation preventing double-selling across channels.
- Pick, pack, ship fulfillment workflow with carrier tracking numbers.

### 3.5 Headless E-Commerce & Storefront Subsystem
- Public REST & GraphQL endpoints for customer storefronts (Product browsing, faceted search, Cart, Stripe Checkout).
- Webhook subscribers for inventory sync, order creation, and payment capture notifications.

---

## 4. Industry Extension Points (Future Verticals)

### 4.1 Healthcare Extension Interface
- Hooks into `Party` to add Medical Record Number (MRN), insurance policies, and allergies.
- Hooks into `Item` to add Prescription (Rx) requirements, dosage units, and controlled drug schedules.
- Hooks into `Financials` to generate Insurance Claim transactions and copay invoices.

### 4.2 Manufacturing & MRP Extension Interface
- Hooks into `Item` to define multi-level Bill of Materials (BOM) and routing operations.
- Implements Work Orders, Machine Work Centers, Scrap tracking, and Material Requirements Planning (MRP).

### 4.3 Construction & Contracting Extension Interface
- Hooks into `Financials` to support Project Job Costing, Subcontractor Retainage, and AIA G702/G703 billing.
- Implements Milestone Claims, Equipment Utilization, and Change Orders.

### 4.4 Logistics & Fleet Extension Interface
- Hooks into `StockMovement` for Consignments, Manifests, Waybills, and Multi-stop route planning.
- Implements Fleet asset tracking, driver dispatch, and Proof-of-Delivery (POD) capture.

### 4.5 Professional Services Extension Interface
- Hooks into `Party` and `Financials` for Client Engagements, Billable Hours Timesheets, Expense Reimbursables, and Milestone Retainers.
