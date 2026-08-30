import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('4. Business Setup & Onboarding Flow', () => {
  it('should complete business setup wizard and update business profile', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'founder@startup.com',
        password: 'Password123!',
        firstName: 'Frank',
        lastName: 'Founder',
        businessName: 'Startup Retail',
      });

    const cookie = reg.headers['set-cookie'];

    // 1. Check initial state isSetupComplete is false
    const initialCheck = await request(app)
      .get('/api/v1/business/current')
      .set('Cookie', cookie);

    expect(initialCheck.body.data.isSetupComplete).toBe(false);

    // 2. Submit Setup Wizard Form
    const setupRes = await request(app)
      .post('/api/v1/business/setup')
      .set('Cookie', cookie)
      .send({
        name: 'Apex Superstore',
        country: 'GB',
        currency: 'GBP',
        timezone: 'Europe/London',
        businessType: 'HYBRID_RETAIL',
        phone: '+44 20 7946 0991',
        email: 'ops@apexsuperstore.co.uk',
        address: {
          street: '10 Oxford Street',
          city: 'London',
          postalCode: 'W1D 1BS',
          country: 'GB',
        },
      });

    expect(setupRes.status).toBe(200);
    expect(setupRes.body.success).toBe(true);
    expect(setupRes.body.data.name).toBe('Apex Superstore');
    expect(setupRes.body.data.currency).toBe('GBP');
    expect(setupRes.body.data.isSetupComplete).toBe(true);
    expect(setupRes.body.data.address.city).toBe('London');

    // 3. Update Business Settings (Tax & Receipts)
    const settingsRes = await request(app)
      .patch('/api/v1/business/settings')
      .set('Cookie', cookie)
      .send({
        taxNumber: 'GB-123456789',
        receiptHeader: 'Welcome to Apex Superstore London',
        receiptFooter: 'Thank you for shopping local!',
        allowNegativeStock: true,
      });

    expect(settingsRes.status).toBe(200);
    expect(settingsRes.body.data.settings.taxNumber).toBe('GB-123456789');
    expect(settingsRes.body.data.settings.allowNegativeStock).toBe(true);
  });
});
