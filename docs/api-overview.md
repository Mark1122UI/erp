# Universal ERP — REST API Specification & Reference

Universal ERP exposes a standardized, RESTful JSON API. All protected endpoints require a valid session cookie or Bearer JWT token.

---

## 1. Global Response Standards

### Successful Response Format (2xx)
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "pagination": {
      "page": 1,
      "limit": 20,
      "totalRecords": 100,
      "totalPages": 5,
      "hasNext": true,
      "hasPrev": false
    }
  }
}
```

### Error Response Format (4xx / 5xx)
```json
{
  "success": false,
  "error": {
    "code": "BAD_REQUEST",
    "message": "Human readable description of the error",
    "details": [],
    "requestId": "req_1787754909950_gdq2h",
    "timestamp": "2026-08-26T15:00:00.000Z"
  }
}
```

---

## 2. Key Endpoint Matrix

| Module | Method | Endpoint | Description | Required Role / Permission |
| :--- | :---: | :--- | :--- | :--- |
| **System** | `GET` | `/health` | Liveness health check | Public |
| **System** | `GET` | `/ready` | Database readiness check | Public |
| **Auth** | `POST` | `/api/v1/auth/register` | Register tenant & owner | Public |
| **Auth** | `POST` | `/api/v1/auth/login` | Authenticate & create session | Public |
| **Auth** | `POST` | `/api/v1/auth/logout` | Clear session cookies | Authenticated |
| **Users** | `GET` | `/api/v1/users` | List tenant users | `USERS_READ` |
| **Users** | `POST` | `/api/v1/users/invite` | Invite staff/admin member | `USERS_MANAGE` |
| **Catalog**| `GET` | `/api/v1/products` | Paginated product listing | `PRODUCTS_READ` |
| **Catalog**| `POST` | `/api/v1/products` | Create product with barcodes | `PRODUCTS_CREATE` |
| **POS** | `GET` | `/api/v1/pos/search` | High-speed POS product scan | `POS_ACCESS` |
| **POS** | `POST` | `/api/v1/pos/checkout` | Complete POS sale | `POS_ACCESS` |
| **POS** | `POST` | `/api/v1/pos/offline-sync`| Synchronize offline batch | `POS_ACCESS` |
| **Inventory**| `GET` | `/api/v1/inventory/stock-levels` | List location stock levels | `INVENTORY_READ` |
| **Inventory**| `POST` | `/api/v1/inventory/transfers` | Transfer stock between locations | `INVENTORY_MANAGE` |
| **Inventory**| `POST` | `/api/v1/inventory/adjustments`| Physical count adjustment | `INVENTORY_MANAGE` |
| **Purchasing**|`POST`| `/api/v1/purchases/receive` | Receive goods receipt (GRN) | `PURCHASES_CREATE` |
| **Purchasing**|`POST`| `/api/v1/purchases/bills/:id/pay` | Pay supplier bill | `PURCHASES_CREATE` |
| **Sales** | `POST` | `/api/v1/sales/returns` | Process sales return & restock | `SALES_CREATE` |
| **Reports** | `GET` | `/api/v1/reports/sales/summary` | Real-time sales report | `REPORTS_VIEW` |
| **Reports** | `GET` | `/api/v1/reports/inventory/current?format=csv` | Export inventory CSV | `REPORTS_VIEW` |
| **Settings**| `GET` | `/api/v1/business/settings` | Business profile & setup | `TENANT_MANAGE` |
