# Universal ERP — Production Security Checklist

This document details all security controls, threat mitigations, and compliance verification checkpoints implemented in Universal ERP.

---

## 1. Authentication & Session Security

- [x] **Secure Cookies**: `HttpOnly: true`, `SameSite: strict`, and `secure: true` in production environments.
- [x] **Token Revocation / Expiry**: JWT access tokens are signed with high-entropy keys and enforce bounded expiration.
- [x] **Password Protection**: Passwords hashed using standard cryptographic algorithms; never logged or returned in API responses.
- [x] **Rate Limiting**: Sliding-window rate limiter prevents brute-force login attempts (10 requests / 15 mins).

---

## 2. Multi-Tenancy & Authorization

- [x] **Zero-Trust Client Identifiers**: All queries derive tenant ownership strictly from verified authentication context (`contextProvider.getRequiredTenantId()`).
- [x] **Cross-Tenant IDOR Defense**: All collection lookups filter by `{ _id, tenantId }`, ensuring attempts to access foreign tenant resources return `404 Not Found`.
- [x] **Role-Based Access Control (RBAC)**: Cashiers and staff roles are strictly restricted from accessing business settings, user invitations, direct stock adjustments, and report exports.

---

## 3. Data & Query Defense

- [x] **NoSQL Injection Sanitization**: Global `mongoSanitizer` middleware strips malicious operator keys (`$gt`, `$where`, `$ne`) from request parameters and payloads.
- [x] **Strict Input Validation**: All incoming requests validated against strict Zod schemas before touching service layers.
- [x] **Immutable Financial Ledger**: Sales, stock movements, and audit logs are recorded sequentially without in-place historical tampering.

---

## 4. Operational & Network Security

- [x] **Security Headers**: `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`, and HSTS enabled.
- [x] **Information Disclosure Protection**: Error handler suppresses stack traces and server file paths across all 500 error responses in production.
- [x] **Safe Structured Logging**: Automatic credential and secret masking engine (`[REDACTED]`) prevents leaking passwords, API keys, or session tokens to logs.
