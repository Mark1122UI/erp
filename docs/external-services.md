# Universal ERP — External Services Configuration Guide

This document clearly outlines external integrations, email relays, and cloud storage systems that require customer-provided credentials in production.

---

## 1. Status Overview

| External Service | Category | Status | Fallback Behavior |
| :--- | :--- | :---: | :--- |
| **AWS S3 / Google Cloud Storage** | File Vaulting | **NOT CONFIGURED** | System stores uploaded assets in local container directory (`/app/uploads`). |
| **SMTP / SendGrid Relay** | Outbound Email | **NOT CONFIGURED** | User invitation tokens and reset links are returned directly in API payloads for manual delivery. |
| **Stripe / Payment Terminal** | Payment Gateway | **CONFIGURED (OPTIONAL)**| Core ERP supports direct Cash, Bank Transfer, and offline register payments out of the box. |
| **Shopify Sync** | E-Commerce Webhook | **CONFIGURED (OPTIONAL)**| Webhook endpoint `/api/v1/integrations/webhooks/shopify` is available when webhook secret is provided. |

---

## 2. Setting Up Cloud Storage (AWS S3 / GCS)

To configure external object storage for high-volume deployments:
1. Create a private bucket (e.g. `s3://my-erp-company-uploads`).
2. Provide IAM credentials with `PutObject`, `GetObject`, `DeleteObject` permissions.
3. Configure environment variables in `.env`:
   ```env
   STORAGE_DRIVER=s3
   AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
   AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
   AWS_REGION=us-east-1
   AWS_S3_BUCKET=my-erp-company-uploads
   ```

---

## 3. Setting Up Outbound Email (SMTP / SendGrid)

To enable automatic email dispatch for invitations, order notifications, and low-stock alerts:
1. Obtain SMTP credentials from SendGrid, Amazon SES, or Mailgun.
2. Configure environment variables in `.env`:
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your_sendgrid_api_key_here
   SMTP_FROM="Apex Superstore <noreply@apexsuperstore.com>"
   ```
3. Test by triggering a user invitation from **Settings $\rightarrow$ Users**.
