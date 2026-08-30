import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { sanitizeLogData, errorMonitor } from '../src/core/common/monitoring.js';
import fs from 'fs';
import path from 'path';

describe('Phase 20: Production Deployment & Release Hardening Audit', () => {
  describe('1. Health & Readiness Probes', () => {
    it('should return healthy status on root /health and /api/health liveness probe', async () => {
      const res = await request(app).get('/health');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('healthy');
      expect(typeof res.body.data.uptime).toBe('number');
      expect(res.body.data.app).toBeDefined();

      const apiRes = await request(app).get('/api/health');
      expect(apiRes.status).toBe(200);
      expect(apiRes.body.data.status).toBe('healthy');
    });

    it('should return ready status on /ready and /api/ready when database is connected', async () => {
      const res = await request(app).get('/ready');
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('ready');
      expect(res.body.data.database).toBe('connected');

      const apiRes = await request(app).get('/api/ready');
      expect(apiRes.status).toBe(200);
      expect(apiRes.body.data.status).toBe('ready');
    });
  });

  describe('2. Production Security Headers', () => {
    it('should include essential security headers on HTTP responses', async () => {
      const res = await request(app).get('/health');

      // Clickjacking defense
      expect(res.headers['x-frame-options']).toBe('DENY');
      // MIME-sniffing defense
      expect(res.headers['x-content-type-options']).toBe('nosniff');
    });
  });

  describe('3. Safe Structured Logging & Secret Masking', () => {
    it('should deeply sanitize sensitive keys and secrets in operational logs', () => {
      const sensitivePayload = {
        email: 'admin@apexstore.com',
        password: 'SuperSecretPassword123!',
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.dummy',
        apiKey: 'sk_live_99201938491029384',
        nested: {
          jwt_secret: 'cryptographic_key_9988',
          creditCard: '4111-2222-3333-4444',
          publicName: 'Apex Store',
        },
        items: [
          { name: 'Coffee', secret_code: 'XYZ123' },
        ],
      };

      const sanitized = sanitizeLogData(sensitivePayload);

      expect(sanitized.email).toBe('admin@apexstore.com');
      expect(sanitized.password).toBe('[REDACTED]');
      expect(sanitized.token).toBe('[REDACTED]');
      expect(sanitized.apiKey).toBe('[REDACTED]');
      expect(sanitized.nested.jwt_secret).toBe('[REDACTED]');
      expect(sanitized.nested.creditCard).toBe('[REDACTED]');
      expect(sanitized.nested.publicName).toBe('Apex Store');
      expect(sanitized.items[0].secret_code).toBe('[REDACTED]');
      expect(sanitized.items[0].name).toBe('Coffee');
    });

    it('should safely log through error monitoring abstraction without throwing', () => {
      expect(() => {
        errorMonitor.log('INFO', 'Test operational log message', { user: 'testUser', tenantId: '12345' });
        errorMonitor.captureException(new Error('Test harmless operational exception'), { tenantId: '12345' });
      }).not.toThrow();
    });
  });

  describe('4. Environment Template (.env.example) Completeness & Safety', () => {
    it('should have .env.example with no hardcoded live secrets', () => {
      const envExamplePath = path.resolve(process.cwd(), '.env.example');
      expect(fs.existsSync(envExamplePath)).toBe(true);

      const content = fs.readFileSync(envExamplePath, 'utf8');

      expect(content).toContain('NODE_ENV=');
      expect(content).toContain('MONGODB_URI=');
      expect(content).toContain('JWT_SECRET=');
      expect(content).toContain('COOKIE_SECRET=');
      expect(content).toContain('CORS_ORIGIN=');

      // Verify no live credentials exist in template
      expect(content).not.toContain('mongodb+srv://admin:actual_production_password@');
      expect(content).toContain('REPLACE_WITH_');
    });
  });
});
