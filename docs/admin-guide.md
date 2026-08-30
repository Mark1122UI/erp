# Universal ERP — Administrator & Business Owner Guide

This guide details configuration, user management, location provisioning, tax policies, and security monitoring for administrators.

---

## 1. Initial Business Setup Wizard

Upon first registration, the system guides you through a 5-step onboarding wizard:
1. **Business Profile**: Business name, tax ID, registration number, and default contact info.
2. **Currency & Locale**: Base currency (e.g. `USD`, `EUR`, `CAD`, `GBP`), timezone, and date format.
3. **Product Catalog**: Add first products or import catalog.
4. **Opening Stock**: Enter initial physical inventory counts per location.
5. **Ready to Sell**: Launch POS register.

---

## 2. User Management & Role-Based Permissions (RBAC)

### Inviting New Team Members
1. Go to **Settings $\rightarrow$ Users**.
2. Click **Invite User**.
3. Enter their email address, first name, last name, and assign an initial role.
4. An invitation token is generated for the user to set their password.

### Supported Role Matrix
- **Owner**: Full access to all business modules, financial reports, settings, and subscription controls.
- **Admin**: Full operational management (Catalog, Inventory, Purchasing, Sales, Users, Settings).
- **Manager**: Inventory adjustments, stock counts, purchasing approvals, and report viewing.
- **Cashier**: High-speed POS access, checkout, barcode scanning, receipt generation, and offline sales.
- **Staff**: Basic catalog and stock viewing.

---

## 3. Managing Locations & Warehouses

1. Go to **Settings $\rightarrow$ Locations**.
2. Click **Add Location**.
3. Specify the name (e.g. `Downtown Retail Store`, `Central Warehouse`), unique code (`STORE-01`), and location type (`STORE` or `WAREHOUSE`).
4. Set the default store location for incoming sales.

---

## 4. Taxes & Currency Configuration

1. Go to **Settings $\rightarrow$ Taxes**.
2. Configure default sales tax rates (e.g. `8.0%` Standard Rate).
3. Tax settings automatically apply to taxable products during POS and Invoice calculations.

---

## 5. Audit Log Inspection & Security Compliance

1. Go to **Settings $\rightarrow$ Audit Logs**.
2. View real-time security events including user logins, role changes, inventory adjustments, and product modifications.
3. Filter logs by User, Entity type, or Date range.
