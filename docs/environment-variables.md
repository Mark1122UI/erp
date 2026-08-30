# Universal ERP — Environment Variables Reference

This document provides a comprehensive reference of all environment variables used by Universal ERP in production.

---

## Core Server Configuration

| Variable | Type | Default | Description | Required in Production |
| :--- | :---: | :---: | :--- | :---: |
| `NODE_ENV` | `string` | `development` | Set to `production` to activate security headers, secure cookies, and strict error suppression. | **YES** |
| `PORT` | `number` | `3000` | HTTP port the application listens on. | **YES** |
| `APP_NAME` | `string` | `Universal-ERP` | Application display identifier in health checks and audit logs. | No |
| `APP_URL` | `string` | `http://localhost:3000` | Public root domain URL of the ERP deployment. | **YES** |

---

## Database Configuration

| Variable | Type | Default | Description | Required in Production |
| :--- | :---: | :---: | :--- | :---: |
| `MONGODB_URI` | `string` | `mongodb://localhost:27017/universal_erp` | MongoDB connection URI with authentication credentials and replica set parameters. | **YES** |

---

## Authentication & Security

| Variable | Type | Default | Description | Required in Production |
| :--- | :---: | :---: | :--- | :---: |
| `JWT_SECRET` | `string` | `dev_jwt_secret...` | High-entropy secret key used to sign and verify JSON Web Tokens (min 64 chars). | **YES** |
| `JWT_EXPIRES_IN` | `string` | `7d` | Token lifetime duration string (e.g. `1d`, `7d`). | No |
| `COOKIE_SECRET` | `string` | `dev_cookie_secret...` | Cryptographic secret used for signing session cookies. | **YES** |
| `CORS_ORIGIN` | `string` | `http://localhost:3000` | Comma-delimited list of allowed origin domains for cross-origin requests. | **YES** |

---

## Rate Limiting & Protection

| Variable | Type | Default | Description | Required in Production |
| :--- | :---: | :---: | :--- | :---: |
| `RATE_LIMIT_AUTH_MAX` | `number` | `10` | Maximum login/register attempts per IP window. | No |
| `RATE_LIMIT_AUTH_WINDOW_MS`| `number` | `900000` (15m) | Sliding window duration for authentication attempts. | No |
| `RATE_LIMIT_API_MAX` | `number` | `200` | Maximum requests per IP window across `/api/*`. | No |
| `RATE_LIMIT_API_WINDOW_MS` | `number` | `60000` (1m) | Sliding window duration for API rate limiting. | No |

---

## Integrations & External Gateways (Optional)

| Variable | Type | Default | Description | Required in Production |
| :--- | :---: | :---: | :--- | :---: |
| `STRIPE_WEBHOOK_SECRET` | `string` | `""` | Signing secret used to verify Stripe webhook authenticity. | If Stripe enabled |
| `SHOPIFY_WEBHOOK_SECRET`| `string` | `""` | HMAC secret for Shopify webhook verification. | If Shopify enabled |
| `SMTP_HOST` | `string` | `""` | Outbound mail server hostname. | If email enabled |
| `SMTP_PORT` | `number` | `587` | Outbound mail server port. | If email enabled |
| `SMTP_USER` | `string` | `""` | SMTP authentication username. | If email enabled |
| `SMTP_PASS` | `string` | `""` | SMTP authentication password. | If email enabled |
| `SMTP_FROM` | `string` | `noreply@erp.example.com`| Sender email address. | If email enabled |
