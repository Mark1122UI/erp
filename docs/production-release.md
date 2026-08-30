# Universal ERP — Production Release Manual

This document details the step-by-step procedure for releasing and deploying Universal ERP to staging and production environments.

---

## 1. Release Package Preparation

1. **Verify Git Working Tree**:
   Ensure all changes are committed and clean.
2. **Execute Full Automated Test Suite**:
   ```bash
   npm test
   ```
   *Requirement: 25 test suites passing, 83 tests passing, 0 failures.*
3. **Compile Production TypeScript Bundle**:
   ```bash
   npm run build
   ```
   *Requirement: Exit code 0, 0 TypeScript errors.*

---

## 2. Docker Image Creation & Verification

1. Build production image:
   ```bash
   docker build -t universal-erp:1.0.0 -t universal-erp:latest .
   ```
2. Test container startup locally:
   ```bash
   docker run --rm -p 3000:3000 --env NODE_ENV=production --env JWT_SECRET=test_secret_key_at_least_64_chars_long_123456789012345678901234567890 universal-erp:latest
   ```
3. Verify health probe:
   ```bash
   curl -f http://localhost:3000/health
   ```

---

## 3. Production Deployment Execution

1. Push tagged image to registry (e.g. Docker Hub / AWS ECR / Google Artifact Registry):
   ```bash
   docker tag universal-erp:1.0.0 your-registry.com/universal-erp:1.0.0
   docker push your-registry.com/universal-erp:1.0.0
   ```
2. Deploy onto production cluster using rolling update strategy.
3. Verify readiness probe `GET /ready` returns `200 OK`.
