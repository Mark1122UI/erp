import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { AuditLog } from '../src/core/audit/audit.model.js';
import { auditService } from '../src/core/audit/audit.service.js';

describe('6. Reusable Audit Log System', () => {
  it('should track actions, sanitize secrets from metadata, and support filtered queries', async () => {
    // 1. Register Owner (triggers CREATE audit record)
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'auditor@firm.com',
        password: 'Password123!',
        firstName: 'Audrey',
        lastName: 'Auditor',
        businessName: 'Audit Firm Inc',
      });

    const cookie = reg.headers['set-cookie'];
    const tenantId = reg.body.data.tenant.id;

    // 2. Perform actions (Update business, Invite user)
    await request(app)
      .post('/api/v1/business/setup')
      .set('Cookie', cookie)
      .send({
        name: 'Audit Firm Worldwide',
        country: 'US',
        currency: 'USD',
        timezone: 'UTC',
        businessType: 'SERVICES',
      });

    // 3. Log a test audit action with sensitive payload to test sanitization
    await auditService.log({
      tenantId,
      action: 'PAYMENT',
      entity: 'PaymentOrder',
      entityId: 'PAY-1002',
      metadata: {
        amount: 250.0,
        cardNumber: '4111111111111234',
        cvv: '123',
        password: 'SuperSecretPassword',
        customerNote: 'Paid in full',
      },
    });

    // 4. Query Audit Logs via API
    const logsRes = await request(app)
      .get('/api/v1/audit')
      .set('Cookie', cookie);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.success).toBe(true);
    expect(logsRes.body.data.length).toBeGreaterThanOrEqual(2);

    // 5. Verify metadata sanitization in the database
    const paymentAudit = await AuditLog.findOne({ action: 'PAYMENT', tenantId });
    expect(paymentAudit).toBeDefined();
    expect(paymentAudit?.metadata?.cardNumber).toBe('[REDACTED]');
    expect(paymentAudit?.metadata?.cvv).toBe('[REDACTED]');
    expect(paymentAudit?.metadata?.password).toBe('[REDACTED]');
    expect(paymentAudit?.metadata?.customerNote).toBe('Paid in full');
    expect(paymentAudit?.metadata?.amount).toBe(250.0);

    // 6. Test Filtered Query by Action
    const filteredRes = await request(app)
      .get('/api/v1/audit?action=PAYMENT')
      .set('Cookie', cookie);

    expect(filteredRes.status).toBe(200);
    expect(filteredRes.body.data.length).toBe(1);
    expect(filteredRes.body.data[0].action).toBe('PAYMENT');
  });
});
