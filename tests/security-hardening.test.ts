import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { createRateLimiter, MemoryStore } from '../src/core/common/rateLimiter.js';
import express from 'express';
import { errorHandler } from '../src/core/common/errorHandler.js';

describe('Phase 18: Security Hardening & Penetration Testing Audit', () => {
  async function createBusiness(email: string, businessName: string) {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'Password123!',
        firstName: 'Owner',
        lastName: 'User',
        businessName,
        country: 'US',
        currency: 'USD',
      });

    return {
      cookie: regRes.headers['set-cookie'],
      tenantId: regRes.body.data.tenant.id,
      userId: regRes.body.data.user.id,
    };
  }

  // -------------------------------------------------------------
  // 1. CROSS-TENANT ISOLATION & IDOR DEFENSE
  // -------------------------------------------------------------
  describe('1. Object-Level Authorization & IDOR Defense', () => {
    it('should strictly block Tenant B from accessing Tenant A customer, product, and document by ID', async () => {
      // 1. Create Tenant A with customer and product
      const tenantA = await createBusiness('ownerA@tenant-a.com', 'Tenant Alpha');

      const custA = await request(app)
        .post('/api/v1/customers')
        .set('Cookie', tenantA.cookie)
        .send({
          displayName: 'Confidential Client A',
          firstName: 'Confidential',
          lastName: 'Client A',
          roles: ['CUSTOMER'],
          email: 'clientA@secret.com',
          phone: '+1-555-1111',
        });
      expect(custA.status).toBe(201);
      const customerAId = custA.body.data._id;

      const prodA = await request(app)
        .post('/api/v1/products')
        .set('Cookie', tenantA.cookie)
        .send({
          name: 'Proprietary Secret Formula Product',
          sku: 'SKU-SECRET-001',
          sellingPrice: 199.99,
          costPrice: 50.0,
        });
      expect(prodA.status).toBe(201);
      const productAId = prodA.body.data._id;

      // 2. Create Tenant B
      const tenantB = await createBusiness('ownerB@tenant-b.com', 'Tenant Beta');

      // 3. Tenant B attempts IDOR attack on Tenant A customer
      const idorCustRes = await request(app)
        .get(`/api/v1/customers/${customerAId}`)
        .set('Cookie', tenantB.cookie);

      expect(idorCustRes.status).toBe(404);
      expect(idorCustRes.body.success).toBe(false);

      // 4. Tenant B attempts IDOR attack on Tenant A product
      const idorProdRes = await request(app)
        .get(`/api/v1/products/${productAId}`)
        .set('Cookie', tenantB.cookie);

      expect(idorProdRes.status).toBe(404);
      expect(idorProdRes.body.success).toBe(false);

      // 5. Tenant B attempts IDOR document generation of Tenant A customer statement
      const idorDocRes = await request(app)
        .get(`/api/v1/documents/customer-statement/${customerAId}`)
        .set('Cookie', tenantB.cookie);

      expect(idorDocRes.status).toBe(404);
    });

    it('should reject invalid or malformed ObjectIds with 400 and not crash or execute queries', async () => {
      const tenant = await createBusiness('owner@validation.com', 'Validation Business');

      const malformedRes = await request(app)
        .get('/api/v1/products/invalid-non-hex-id-123')
        .set('Cookie', tenant.cookie);

      expect(malformedRes.status).toBe(400);
      expect(malformedRes.body.error.code).toBe('INVALID_ID_FORMAT');
    });
  });

  // -------------------------------------------------------------
  // 2. NOSQL OPERATOR INJECTION PREVENTION
  // -------------------------------------------------------------
  describe('2. NoSQL Operator Injection Defense', () => {
    it('should sanitize $gt / $where operator injection attempts in request payloads', async () => {
      const tenant = await createBusiness('owner@nosql.com', 'NoSQL Test Business');

      // Attempt NoSQL query operator injection in customer creation / search
      const maliciousPayload = {
        displayName: 'Normal Name',
        firstName: 'Normal',
        lastName: 'Name',
        roles: ['CUSTOMER'],
        email: 'test@normal.com',
        $gt: '',
        $where: 'sleep(5000)',
        nested: {
          $ne: null,
          validKey: 'safeValue',
        },
      };

      const res = await request(app)
        .post('/api/v1/customers')
        .set('Cookie', tenant.cookie)
        .send(maliciousPayload);

      expect(res.status).toBe(201);
      // Verify MongoDB document does not contain $ operator keys
      expect(res.body.data['$gt']).toBeUndefined();
      expect(res.body.data['$where']).toBeUndefined();
    });
  });

  // -------------------------------------------------------------
  // 3. RATE LIMITING & BRUTE FORCE PROTECTION
  // -------------------------------------------------------------
  describe('3. Rate Limiting & Brute Force Defense', () => {
    it('should throttle requests and return HTTP 429 when rate limit threshold is exceeded', async () => {
      // Test sliding window rate limiter with small test store
      const testStore = new MemoryStore();
      const testLimiter = createRateLimiter(
        {
          windowMs: 5000,
          max: 3,
          message: 'Rate limit test exceeded',
          keyGenerator: () => 'test_client_ip',
        },
        testStore
      );

      const testApp = express();
      testApp.use(testLimiter);
      testApp.get('/test-endpoint', (req, res) => res.json({ ok: true }));
      testApp.use(errorHandler);

      // Requests 1, 2, 3 should succeed
      for (let i = 1; i <= 3; i++) {
        const res = await request(testApp).get('/test-endpoint');
        expect(res.status).toBe(200);
        expect(res.headers['ratelimit-limit']).toBe('3');
      }

      // Request 4 should trigger 429 Too Many Requests
      const throttledRes = await request(testApp).get('/test-endpoint');
      expect(throttledRes.status).toBe(429);
      expect(throttledRes.body.error.code).toBe('TOO_MANY_REQUESTS');
      expect(throttledRes.headers['retry-after']).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 4. INFORMATION DISCLOSURE & STACK TRACE PROTECTION
  // -------------------------------------------------------------
  describe('4. Information Disclosure & Stack Trace Protection', () => {
    it('should never expose stack traces or internal server paths in error responses', async () => {
      const testApp = express();
      testApp.get('/crash-test', () => {
        throw new Error('Simulated internal unexpected server failure with secret internal path /var/secrets/key.pem');
      });
      testApp.use(errorHandler);

      const res = await request(testApp).get('/crash-test');
      expect(res.status).toBe(500);
      expect(res.body.success).toBe(false);
      expect(res.body.error.stack).toBeUndefined(); // Stack MUST NOT be leaked
      expect(res.body.error.code).toBe('INTERNAL_SERVER_ERROR');
      expect(res.body.error.requestId).toBeDefined();
      expect(res.body.error.timestamp).toBeDefined();
    });
  });

  // -------------------------------------------------------------
  // 5. RBAC PERMISSION ENFORCEMENT & PRIVILEGE ESCALATION
  // -------------------------------------------------------------
  describe('5. RBAC Permission Boundaries', () => {
    it('should block Cashier role from accessing tenant settings, user management, and financials', async () => {
      const { cookie } = await createBusiness('admin@store.com', 'RBAC Store');

      // Invite a Cashier
      const inviteRes = await request(app)
        .post('/api/v1/users/invite')
        .set('Cookie', cookie)
        .send({
          email: 'cashier@store.com',
          firstName: 'Charlie',
          lastName: 'Cashier',
          role: 'Cashier',
        });
      expect(inviteRes.status).toBe(201);
      const inviteToken = inviteRes.body.data.invitationToken;

      // Accept invitation
      await request(app)
        .post('/api/v1/users/accept-invitation')
        .send({
          token: inviteToken,
          password: 'Password123!',
        });

      // Login as Cashier
      const cashierLogin = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'cashier@store.com',
          password: 'Password123!',
        });
      expect(cashierLogin.status).toBe(200);
      const cashierCookie = cashierLogin.headers['set-cookie'];

      // 1. Cashier attempts to access Settings -> 403 Forbidden
      const settingsRes = await request(app)
        .get('/api/v1/business/settings')
        .set('Cookie', cashierCookie);
      expect(settingsRes.status).toBe(403);
      expect(settingsRes.body.error.code).toBe('FORBIDDEN');

      // 2. Cashier attempts to invite users -> 403 Forbidden
      const userInviteRes = await request(app)
        .post('/api/v1/users/invite')
        .set('Cookie', cashierCookie)
        .send({
          email: 'hacker@store.com',
          firstName: 'Evil',
          lastName: 'User',
          role: 'Owner',
        });
      expect(userInviteRes.status).toBe(403);

      // 3. Cashier attempts to access Financials summary -> 403 Forbidden
      const financialSummaryRes = await request(app)
        .get('/api/v1/money/summary')
        .set('Cookie', cashierCookie);
      expect(financialSummaryRes.status).toBe(403);
      expect(financialSummaryRes.body.error.code).toBe('FORBIDDEN');
    });
  });

  // -------------------------------------------------------------
  // 6. SECURITY HEADERS & COOKIE HARDENING
  // -------------------------------------------------------------
  describe('6. Security Headers & Cookie Flags', () => {
    it('should return strict security headers on API responses', async () => {
      const res = await request(app).get('/api/health');
      expect(res.status).toBe(200);
      expect(res.headers['x-frame-options']).toBe('DENY');
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });

    it('should set HttpOnly and SameSite flags on access and refresh tokens', async () => {
      const reg = await request(app)
        .post('/api/v1/auth/register')
        .send({
          email: 'cookie.test@domain.com',
          password: 'Password123!',
          firstName: 'Cookie',
          lastName: 'Tester',
          businessName: 'Cookie Business',
        });

      const cookies = reg.headers['set-cookie'];
      expect(cookies).toBeDefined();

      const accessCookie = cookies.find((c: string) => c.includes('access_token='));
      expect(accessCookie).toContain('HttpOnly');
      expect(accessCookie?.toLowerCase()).toContain('samesite=strict');
    });
  });
});
