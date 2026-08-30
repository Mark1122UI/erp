# Universal ERP — Master Feature Inventory

This document details the actual implemented functionality across all modules of Universal ERP (MVP v1.0.0).

---

## 1. UNIVERSAL CORE
- **Multi-Tenancy Engine**: **IMPLEMENTED** — Complete data isolation across tenants using context-injected `tenantId`.
- **Identity & Authentication**: **IMPLEMENTED** — Password hashing, JWT token generation, `HttpOnly`/`SameSite: strict` session cookies.
- **Role-Based Access Control (RBAC)**: **IMPLEMENTED** — Permission matrix supporting Owner, Admin, Manager, Cashier, and Staff roles.
- **Audit Logging**: **IMPLEMENTED** — Immutable security and entity change log capturing user IDs, timestamps, and mutation diffs.

---

## 2. RETAIL & CATALOG
- **Category Hierarchy**: **IMPLEMENTED** — Nested categories with slug generation and active status toggles.
- **Product Management**: **IMPLEMENTED** — Single products, variant matrices, pricing, tax status, and reorder levels.
- **Unit Conversions**: **IMPLEMENTED** — Base units and conversion factors (e.g. PCS, BOX, KG, LTR).
- **Multi-Barcode Management**: **IMPLEMENTED** — Multiple barcodes per product/variant supporting EAN13, UPC_A, CODE128, CODE39, and QR.

---

## 3. POINT OF SALE (POS)
- **High-Speed Product Search**: **IMPLEMENTED** — Exact barcode fast-path with lean JSON field projections.
- **Hardware & Camera Barcode Scanner**: **IMPLEMENTED** — Continuous scanning buffer and camera scanner integration via `scanner.js`.
- **Cash / Card Checkout**: **IMPLEMENTED** — Split tender, cash change calculation, and tax computation.
- **Thermal Receipt Generation**: **IMPLEMENTED** — Instant 58mm / 80mm printable thermal receipt payload.

---

## 4. INVENTORY ENGINE
- **Multi-Location Management**: **IMPLEMENTED** — Stores, warehouses, and branches with default location assignment.
- **Immutable Movement Ledger**: **IMPLEMENTED** — Non-destructive balance tracking (`OPENING_BALANCE`, `PURCHASE`, `SALE`, `TRANSFER_IN`, `TRANSFER_OUT`, `DAMAGE`, `ADJUSTMENT`).
- **Stock Transfers**: **IMPLEMENTED** — Two-phase transfer workflow (Dispatch from source $\rightarrow$ Receive at destination).
- **Physical Stock Count & Reconciliation**: **IMPLEMENTED** — Reconciliation adjustments with reason codes (`PHYSICAL_COUNT`, `DAMAGED_EXPIRED`, `FOUND_STOCK`, `THEFT_LOSS`).

---

## 5. SALES & INVOICING
- **Sales Orders & Direct Invoicing**: **IMPLEMENTED** — Sequential invoice numbering, discount management, and tax calculation.
- **Sales Returns & Restocking**: **IMPLEMENTED** — Customer returns with automatic stock restitution and cash/credit refund handling.
- **Customer Account Tracking**: **IMPLEMENTED** — Credit limits, payment terms, and accounts receivable balance tracking.

---

## 6. PURCHASING & AP
- **Purchase Orders (PO)**: **IMPLEMENTED** — Vendor purchase orders with line items and status lifecycle.
- **Goods Receipt (GRN)**: **IMPLEMENTED** — Receiving shipments with automated inventory increment and AP supplier bill generation.
- **Supplier Bills & Payments**: **IMPLEMENTED** — Bill tracking, partial/full payments via Cash/Bank Transfer, and AP balance clearing.

---

## 7. FINANCE & MONEY
- **Expense Tracking**: **IMPLEMENTED** — Operational expense logging categorized by Utilities, Rent, Payroll, Marketing, etc.
- **Accounts Receivable / Payable**: **IMPLEMENTED** — Customer outstanding balances and supplier dues ledgers.
- **Integer Cents Precision**: **IMPLEMENTED** — Monetary calculations executed via integer cents arithmetic to eliminate IEEE-754 floating-point drift.

---

## 8. DOCUMENT ENGINE
- **Thermal Receipt**: **IMPLEMENTED** — Plain text / ESC-POS compatible layouts.
- **Tax Invoice & Packing Slip**: **IMPLEMENTED** — Clean HTML / printable document templates.
- **Purchase Order & Goods Receipt**: **IMPLEMENTED** — Formal vendor documentation layouts.

---

## 9. REPORTS & ANALYTICS
- **Profit & Loss (P&L)**: **IMPLEMENTED** — Revenue, Cost of Goods Sold (COGS), gross margin, operating expenses, and net profit.
- **Sales Summary & Analytics**: **IMPLEMENTED** — Sales aggregated by date, product, category, and payment method.
- **Stock Valuation & Low Stock**: **IMPLEMENTED** — Real-time inventory valuation at cost and low stock alerts.
- **Data Exports**: **IMPLEMENTED** — CSV exports for products, inventory stock, sales, and purchases with attachment headers.

---

## 10. TASKS & GLOBAL SEARCH
- **Internal Task Management**: **IMPLEMENTED** — Task creation, priority levels, assignment to users, and status tracking.
- **In-App Notifications**: **IMPLEMENTED** — Real-time low-stock, transfer dispatch, and payment alert notifications.
- **Global Search Engine**: **IMPLEMENTED** — Unified cross-entity search indexing products, customers, suppliers, and sales.

---

## 11. THIRD-PARTY INTEGRATIONS & WEBHOOKS
- **Stripe / Shopify Webhook Ingestion**: **IMPLEMENTED** — Signature validation and event processing.
- **External Outbound Webhooks**: **IMPLEMENTED** — Tenant-configurable outbound HTTP webhooks on sales and inventory events.

---

## 12. OFFLINE CAPABILITIES
- **Client Offline Storage**: **IMPLEMENTED** — Top 1,000 product catalog cached in browser `localStorage` with quota protection.
- **Offline Sale Generation**: **IMPLEMENTED** — Offline transaction creation with unique `offlineSaleId`.
- **Idempotent Synchronization**: **IMPLEMENTED** — Background batch sync upon network reconnection with duplicate replay prevention.

---

## 13. SECURITY & HARDENING
- **Cross-Tenant IDOR Defense**: **IMPLEMENTED** — Zero-trust tenant isolation with 404 response masking.
- **NoSQL Injection Sanitizer**: **IMPLEMENTED** — Global operator stripping middleware (`$where`, `$gt`, `$ne`).
- **Rate Limiting**: **IMPLEMENTED** — Sliding-window rate limiters on authentication and API endpoints.
- **Production Security Headers**: **IMPLEMENTED** — `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, Referrer-Policy, and HSTS.
- **Safe Structured Logging**: **IMPLEMENTED** — Automatic redaction of passwords, tokens, API keys, and secrets.

---

## 14. ADMINISTRATION & ONBOARDING
- **User Onboarding Wizard**: **IMPLEMENTED** — 5-step guided wizard for first-time business owners.
- **Setup Checklist**: **IMPLEMENTED** — Dynamic progress checklist tracking profile, products, location, and opening stock.
- **Modular Settings Hub**: **IMPLEMENTED** — Business, Users, Roles, Locations, Taxes, Currency, Receipt, Notifications, and Security settings.
