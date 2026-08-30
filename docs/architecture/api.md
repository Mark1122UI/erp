# Universal ERP / Business Operating System — API Architecture & Contracts

## 1. API Protocol & Design Principles

The API layer exposes high-performance, stateless RESTful interfaces with real-time WebSocket event streams and standardized Webhook receivers.

### Key Principles
1. **Tenant-Context Invariant**: Every request resolves a `TenantContext` containing `tenantId`, `userId`, `organizationId`, and `branchId`.
2. **Standardized Response Envelope**: Uniform response structures for success and error states.
3. **Idempotency Guarantee**: Mutation endpoints support `Idempotency-Key` headers to prevent duplicate executions (especially crucial for POS offline reconciliation and payment processing).
4. **Structured Error Handling**: Adheres to RFC 7807 (Problem Details for HTTP APIs).
5. **Cursor & Offset Pagination**: Cursor pagination for high-volume operational streams (e.g. stock movements, journal entries) and offset pagination for UI data tables.

---

## 2. Global Headers & Context Resolution

### 2.1 Standard Request Headers
```http
Authorization: Bearer <JWT_ACCESS_TOKEN>
X-Tenant-ID: 64f1a2b3c4d5e6f7a8b9c0d1         (Optional if derived from subdomain)
X-Organization-ID: 64f1a2b3c4d5e6f7a8b9c0d2   (Active organization/subsidiary)
X-Branch-ID: 64f1a2b3c4d5e6f7a8b9c0d3         (Active store/warehouse)
Idempotency-Key: 9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d (Mandatory on POS checkout / payment)
```

### 2.2 Standard Success Response Envelope
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "requestId": "req_84920491823",
    "timestamp": "2026-08-24T14:30:00.000Z",
    "pagination": {
      "page": 1,
      "limit": 50,
      "totalRecords": 1420,
      "totalPages": 29,
      "hasNext": true,
      "hasPrev": false,
      "nextCursor": "eyJfaWQiOiI2NGYxYTJiM2M0ZDVlNmY3YThiOWMwZDEifQ=="
    }
  }
}
```

### 2.3 Standard Error Response Envelope (RFC 7807)
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Available stock (3) is less than requested quantity (5) for SKU 'TSHIRT-BLK-L'.",
    "details": [
      {
        "field": "items[0].quantity",
        "issue": "STOCK_DEFICIT",
        "requested": 5,
        "available": 3,
        "sku": "TSHIRT-BLK-L"
      }
    ],
    "requestId": "req_84920491823",
    "timestamp": "2026-08-24T14:30:00.000Z"
  }
}
```

---

## 3. Core API Route Catalog

### 3.1 Authentication & Tenant Resolution
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/auth/login` | User login (returns access + refresh tokens) | No |
| `POST` | `/api/v1/auth/refresh` | Rotate refresh token | No |
| `POST` | `/api/v1/auth/pin-login` | Fast POS PIN authentication for shift switch | Yes (Terminal scope) |
| `POST` | `/api/v1/auth/logout` | Revoke active session tokens | Yes |
| `GET` | `/api/v1/auth/me` | Current user profile, permissions, active branch | Yes |

### 3.2 Tenant & Organization Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/organizations` | List all legal entities under tenant | Yes (`org:read`) |
| `POST` | `/api/v1/organizations` | Create legal entity / subsidiary | Yes (`org:create`) |
| `GET` | `/api/v1/branches` | List branches / retail stores / warehouses | Yes (`branch:read`) |
| `POST` | `/api/v1/branches` | Register new store / warehouse node | Yes (`branch:create`) |

### 3.3 Universal Accounting & Double-Entry Ledger
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/financials/accounts` | Fetch Chart of Accounts tree | Yes (`accounting:read`) |
| `POST` | `/api/v1/financials/accounts` | Create ledger account | Yes (`accounting:write`) |
| `GET` | `/api/v1/financials/journal-entries` | Query journal entries with line details | Yes (`accounting:read`) |
| `POST` | `/api/v1/financials/journal-entries` | Post balanced manual / reference journal entry | Yes (`accounting:post`) |
| `GET` | `/api/v1/financials/reports/trial-balance` | Generate real-time Trial Balance report | Yes (`accounting:reports`) |
| `GET` | `/api/v1/financials/reports/profit-loss` | Generate P&L statement | Yes (`accounting:reports`) |
| `GET` | `/api/v1/financials/reports/balance-sheet` | Generate Balance Sheet statement | Yes (`accounting:reports`) |

### 3.4 Universal Inventory & Stock Engine
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/inventory/items` | Query catalog items with filters & search | Yes (`inventory:read`) |
| `POST` | `/api/v1/inventory/items` | Create new catalog item / SKU | Yes (`inventory:create`) |
| `GET` | `/api/v1/inventory/items/:id` | Get item details with variant hierarchy | Yes (`inventory:read`) |
| `GET` | `/api/v1/inventory/stock-levels` | Real-time stock levels across branches | Yes (`inventory:read`) |
| `POST` | `/api/v1/inventory/adjustments` | Stock count adjustment (with journal entry) | Yes (`inventory:adjust`) |
| `POST` | `/api/v1/inventory/transfers` | Transfer stock between branches/warehouses | Yes (`inventory:transfer`) |
| `GET` | `/api/v1/inventory/movements` | Audit log of all stock movements | Yes (`inventory:audit`) |

### 3.5 Universal CRM & Party Management
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/parties` | Search customers, suppliers, vendors | Yes (`parties:read`) |
| `POST` | `/api/v1/parties` | Create new customer / supplier profile | Yes (`parties:write`) |
| `GET` | `/api/v1/parties/:id/statement` | Customer/Supplier AR/AP ledger statement | Yes (`parties:read`) |

---

## 4. Retail & E-Commerce Specialized APIs

### 4.1 POS Terminal & Cashier Shift APIs
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/pos/shifts/open` | Open register shift with float cash | Yes (`pos:operate`) |
| `GET` | `/api/v1/pos/shifts/current` | Get active shift details & totals | Yes (`pos:operate`) |
| `POST` | `/api/v1/pos/shifts/close` | Close shift, declare cash, compute variance | Yes (`pos:operate`) |
| `POST` | `/api/v1/pos/checkout` | Process live POS checkout transaction | Yes (`pos:checkout`) |
| `POST` | `/api/v1/pos/sync-batch` | Offline sync endpoint (submits offline queue) | Yes (`pos:operate`) |
| `POST` | `/api/v1/pos/returns` | Process item return & issue refund/credit | Yes (`pos:refund`) |

### 4.2 Barcode & Quick Catalog APIs
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/retail/barcode/scan/:code` | Instant barcode resolver (EAN/UPC/Code128) | Yes (`pos:operate`) |
| `POST` | `/api/v1/retail/barcode/generate-labels` | Generate printable PDF barcode sheet | Yes (`inventory:print`) |

### 4.3 Omnichannel Orders & E-Commerce APIs
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/ecommerce/orders` | Query omnichannel orders (POS, Web, Shopify) | Yes (`orders:read`) |
| `POST` | `/api/v1/ecommerce/orders` | Create online order (Checkout API) | API Key / Token |
| `PATCH` | `/api/v1/ecommerce/orders/:id/fulfill` | Mark order packed & assign tracking number | Yes (`orders:fulfill`) |
| `POST` | `/api/v1/ecommerce/webhooks/shopify` | Shopify webhook receiver for order/stock sync | HMAC Signature |
| `POST` | `/api/v1/ecommerce/webhooks/stripe` | Stripe webhook receiver for payment capture | Stripe Signature |

### 4.4 Pricing & Promotion APIs
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/v1/promotions/validate` | Validate coupon code & compute cart discount | Yes (`pos:operate`) |
| `GET` | `/api/v1/promotions` | List active marketing campaigns & discounts | Yes (`promotions:read`) |
| `POST` | `/api/v1/promotions` | Create dynamic discount / BOGO rule | Yes (`promotions:write`) |
