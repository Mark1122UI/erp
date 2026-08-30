import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('2. Multi-Tenancy & Strict Tenant Isolation', () => {
  it('should enforce that User from Tenant A cannot access or mutate Tenant B data', async () => {
    // 1. Register Tenant A (Alpha Store)
    const resA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@alphastore.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Alpha',
        businessName: 'Alpha Store',
      });
    const cookieA = resA.headers['set-cookie'];
    const tenantAId = resA.body.data.tenant.id;

    // 2. Register Tenant B (Beta Emporium)
    const resB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@betaemporium.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Beta',
        businessName: 'Beta Emporium',
      });
    const cookieB = resB.headers['set-cookie'];
    const tenantBId = resB.body.data.tenant.id;

    // 3. User A queries own business settings -> Success
    const currentA = await request(app)
      .get('/api/v1/business/current')
      .set('Cookie', cookieA);

    expect(currentA.status).toBe(200);
    expect(currentA.body.data.name).toBe('Alpha Store');

    // 4. User B queries own business settings -> Success
    const currentB = await request(app)
      .get('/api/v1/business/current')
      .set('Cookie', cookieB);

    expect(currentB.status).toBe(200);
    expect(currentB.body.data.name).toBe('Beta Emporium');

    // 5. ATTACK ATTEMPT: User A sends X-Tenant-ID header of Tenant B
    const attackRes = await request(app)
      .get('/api/v1/business/current')
      .set('Cookie', cookieA)
      .set('X-Tenant-ID', tenantBId);

    // Must be blocked because User A is NOT a member of Tenant B
    expect(attackRes.status).toBe(403);
    expect(attackRes.body.success).toBe(false);
    expect(attackRes.body.error.code).toBe('FORBIDDEN');

    // 6. User A lists users -> only sees Alice Alpha, never Bob Beta
    const usersA = await request(app)
      .get('/api/v1/users')
      .set('Cookie', cookieA);

    expect(usersA.status).toBe(200);
    expect(usersA.body.data.length).toBe(1);
    expect(usersA.body.data[0].email).toBe('owner@alphastore.com');

    // 7. User B lists users -> only sees Bob Beta
    const usersB = await request(app)
      .get('/api/v1/users')
      .set('Cookie', cookieB);

    expect(usersB.status).toBe(200);
    expect(usersB.body.data.length).toBe(1);
    expect(usersB.body.data[0].email).toBe('owner@betaemporium.com');
  });

  it('should reject unauthenticated and missing tenant context requests', async () => {
    const res = await request(app).get('/api/v1/business/current');
    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });
});
