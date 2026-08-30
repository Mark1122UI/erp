# Universal ERP / Business Operating System — Security Architecture

## 1. Zero-Trust Multi-Tenant Security Model

The security model is built on zero-trust principles, enforcing strict tenant isolation across all layers:

```
[ Incoming Request ]
         │
         ▼
[ API Gateway: Subdomain & JWT Tenant Extraction ]
         │
         ▼
[ Context Provider: Injects AsyncLocalStorage Tenant Context ]
         │
         ▼
[ Mongoose Query Interceptor: Enforces { tenantId } Filter on All DB Queries ]
         │
         ▼
[ Service Layer: ABAC / RBAC Permission Evaluation ]
         │
         ▼
[ Database Execution (MongoDB) ]
```

---

## 2. Authentication Architecture

### 2.1 Token Lifecycle & Security
1. **Access Tokens**: Short-lived JWTs (15-minute lifespan) containing `userId`, `tenantId`, `roleIds`, and `permissions` hash.
2. **Refresh Tokens**: Long-lived (7-day lifespan) cryptographically secure opaque tokens stored in httpOnly, Secure, SameSite=Strict cookies with automatic rotation and family revocation on reuse detection.
3. **POS Terminal Quick PIN**:
   - Cashiers on an active terminal can switch sessions using a 4-to-6 digit PIN.
   - PINs are salted and hashed using **Argon2id** (`argon2id` with memory cost 64MB).
   - Rate-limited to max 5 failed attempts per terminal per 5 minutes before locking the terminal.
4. **Multi-Factor Authentication (MFA)**:
   - TOTP (Time-based One-Time Password) RFC 6238 compliant for administrative and accounting roles.

---

## 3. Authorization Engine (RBAC + ABAC)

The system pairs Role-Based Access Control with Attribute-Based Access Control (ABAC):

### 3.1 Permission Matrix Specification
Permissions follow the `<domain>:<resource>:<action>` convention:
- `core:inventory:create`
- `core:financials:post_journal`
- `retail:pos:apply_discount`
- `retail:pos:issue_refund`

### 3.2 ABAC Dynamic Policy Constraints
ABAC rules evaluate context parameters at runtime:
```json
{
  "resource": "retail:pos:apply_discount",
  "rule": {
    "maxDiscountPercentage": 20,
    "requiresManagerOverrideAbove": 20
  }
}
```

---

## 4. Data Protection & Cryptography

### 4.1 Encryption at Rest & in Transit
- **In Transit**: Mandatory TLS 1.3 with strict HSTS headers.
- **At Rest**: MongoDB WiredTiger encryption enabled via AES-256-CBC.
- **Client-Side Field-Level Encryption (CSFLE)**: Sensitive fields (tax IDs, customer payment tokens, bank account details) are encrypted before writing to MongoDB.

### 4.2 PCI-DSS Compliance Invariant
- **No Raw Cardholder Data**: Raw credit card numbers (PAN), CVVs, or magnetic stripe data are **NEVER** stored or transmitted through our servers.
- All payments utilize certified tokenization gateways (e.g. Stripe Elements, Terminal SDK, Adyen).

---

## 5. Threat Defense & API Hardening

### 5.1 NoSQL Injection Protection
- Strict validation of all user payloads using **Zod** schemas before reaching database query builders.
- Prohibition of raw, unsanitized object queries (e.g. preventing `{ $gt: '' }` bypass attacks).

### 5.2 Rate Limiting & DoS Protection
- Token-bucket rate limiter via Redis:
  - Public Auth endpoints: 5 requests / minute per IP.
  - General API endpoints: 120 requests / minute per user.
  - POS Scanner & Sync endpoints: 600 requests / minute per terminal.

### 5.3 Tamper-Evident Audit Trails
- Critical actions (Financial Postings, Stock Adjustments, Cash Drawer Drops, Permission Changes) are recorded in an append-only collection.
- Records include cryptographic SHA-256 hash chaining (`previousHash` + `currentPayload` $\to$ `recordHash`) to prevent database tampering.
