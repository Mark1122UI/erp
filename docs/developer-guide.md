# Universal ERP — Developer & Architecture Guide

This guide provides technical specifications, codebase architecture, multi-tenancy invariants, and extension guidelines for software engineers.

---

## 1. Directory Structure

```
ERP/
├── public/                 # Static PWA frontend assets (HTML, CSS, JS, scanner)
├── src/
│   ├── app.ts              # Express application configuration & middleware stack
│   ├── server.ts           # HTTP server initialization & graceful shutdown
│   ├── config/             # Environment variables and database connection
│   └── core/               # Domain-Driven Core Modules
│       ├── audit/          # Security & entity change audit log
│       ├── catalog/        # Products, categories, units, and barcodes
│       ├── common/         # Context, sanitizers, error handlers, rate limiters
│       ├── documents/      # Thermal, invoice, PO, and delivery note generators
│       ├── identity/       # Users, auth routes, JWT token service
│       ├── integrations/   # Webhook ingestion and outbound dispatchers
│       ├── inventory/      # Locations, inventory items, movement ledger, transfers
│       ├── money/          # Expenses, accounts receivable, and integer math
│       ├── notifications/  # In-app notifications engine
│       ├── parties/        # Customers and suppliers (CRM / SRM)
│       ├── pos/            # POS fast-path search, checkout, and offline sync
│       ├── purchasing/     # Purchase orders, goods receipt (GRN), supplier bills
│       ├── rbac/           # Permission matrix and RBAC middleware
│       ├── reports/        # Real-time analytics, P&L, and CSV exporters
│       ├── sales/          # Universal sales engine, invoices, returns
│       ├── search/         # Global cross-entity search engine
│       ├── tasks/          # Internal task tracking engine
│       └── tenancy/        # Multi-tenant isolation and context resolution
├── tests/                  # Integration and benchmark test suites
├── Dockerfile              # Production multi-stage Docker build
└── docker-compose.yml      # Local / self-hosted container orchestration
```

---

## 2. Multi-Tenancy Architecture Invariants

1. **Context-Injected Tenancy**: Every authenticated request populates `contextProvider` with the verified `tenantId`.
2. **Never Trust Client Identifiers**: Always use `contextProvider.getRequiredTenantId()`. Never accept tenant IDs from `req.body` or `req.params`.
3. **Compound Key Indexing**: Every database collection prefixes index definitions with `tenantId`.

---

## 3. Monetary Arithmetic Standard

To prevent IEEE-754 floating-point inaccuracies, all monetary calculations utilize the `Money` utility in `src/core/money/money.service.ts`:
- Amounts are stored in decimal representation for compatibility.
- Intermediate multiplication, addition, tax rates, and discounts are computed using integer cents.

---

## 4. Running the Development Environment

```bash
# Install dependencies
npm install

# Start local development server with live reload
npm run dev

# Run automated test suite
npm test

# Build production bundle
npm run build
```
