# Universal ERP — Release Notes (MVP v1.0.0)

**Release Date:** August 2026  
**Build Version:** `v1.0.0` (Production Certified)

---

## 🌟 Overview

Universal ERP is an enterprise-grade, high-performance Business Operating System and ERP designed for modern retail stores, multi-location warehouses, and small-to-medium businesses.

---

## 🚀 Key Features in MVP v1.0.0

- **Multi-Tenancy & Data Isolation**: Enterprise-grade tenant boundaries with complete cross-tenant IDOR prevention.
- **Role-Based Access Control (RBAC)**: Matrix covering Owner, Admin, Manager, Cashier, and Staff roles.
- **Product Catalog & Unit Conversions**: Variable units, packaging conversions, categories, and multi-barcode support (EAN13, UPC, CODE128, CODE39, QR).
- **High-Speed Point of Sale (POS)**: Sub-50ms barcode scanning, fast checkout, cash change calculations, and thermal receipts.
- **Offline POS & Idempotent Sync**: Continuous offline selling during network outages with guaranteed exactly-once batch synchronization upon reconnection.
- **Inventory Ledger**: Real-time stock movement ledger, two-phase transfers, physical count reconciliations, and low-stock alerts.
- **Purchasing & AP**: Vendor purchase orders, goods receipt (GRN) auto-restocking, supplier bills, and payment records.
- **Universal Sales & Invoicing**: Direct sales, invoice numbering, discounts, and customer return restock processing.
- **Finance & Money**: Operating expense tracker, accounts receivable, and exact integer cents calculation engine.
- **Document Engine**: Thermal receipts (58mm/80mm), tax invoices, delivery notes, and purchase orders.
- **Real-Time Analytics & CSV Exports**: Live P&L reporting, sales summaries, stock valuation, and streaming CSV downloads.
- **Containerization & Health Checks**: Production multi-stage Docker build, docker-compose orchestration, `/health`, and `/ready` probes.
- **Security Hardening**: Secure cookies, production security headers, NoSQL operator sanitizer, and secret masking logs.

---

## ⚠️ Known External Requirements
- Cloud S3/GCS file vaulting requires customer-supplied IAM credentials.
- Automatic outbound email notifications require customer-supplied SMTP credentials.
