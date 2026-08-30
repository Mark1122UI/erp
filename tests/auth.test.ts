import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/core/identity/user.model.js';
import { Tenant } from '../src/core/tenancy/tenant.model.js';

describe('1. Authentication Core', () => {
  it('should register a new business owner and return secure tokens & cookies', async () => {
    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'owner@acmeretail.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Smith',
        businessName: 'Acme Retail Inc',
        country: 'US',
        currency: 'USD',
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.user.email).toBe('owner@acmeretail.com');
    expect(res.body.data.tenant.name).toBe('Acme Retail Inc');
    expect(res.body.data.role).toBe('Owner');

    // Verify HttpOnly cookie is set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    const hasAccessTokenCookie = cookies.some((c: string) => c.includes('access_token=') && c.includes('HttpOnly'));
    expect(hasAccessTokenCookie).toBe(true);

    // Verify in database: Password is properly hashed
    const userInDb = await User.findOne({ email: 'owner@acmeretail.com' });
    expect(userInDb).toBeDefined();
    expect(userInDb?.passwordHash).not.toBe('Password123!');
    expect(userInDb?.passwordHash.startsWith('$2')).toBe(true);
  });

  it('should reject registration with duplicate email', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'alice@business.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Smith',
        businessName: 'Business A',
      });

    const res = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'alice@business.com',
        password: 'Password456!',
        firstName: 'Alice',
        lastName: 'Jones',
        businessName: 'Business B',
      });

    expect(res.status).toBe(409);
    expect(res.body.success).toBe(false);
    expect(res.body.error.code).toBe('CONFLICT');
  });

  it('should login successfully with correct credentials and reject wrong password', async () => {
    // 1. Register user
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'bob@retail.com',
        password: 'SecurePassword123!',
        firstName: 'Bob',
        lastName: 'Miller',
        businessName: 'Bob Goods',
      });

    // 2. Test Invalid Password
    const badLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'bob@retail.com',
        password: 'WrongPassword!',
      });

    expect(badLogin.status).toBe(401);
    expect(badLogin.body.success).toBe(false);

    // 3. Test Successful Login
    const goodLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'bob@retail.com',
        password: 'SecurePassword123!',
      });

    expect(goodLogin.status).toBe(200);
    expect(goodLogin.body.success).toBe(true);
    expect(goodLogin.body.data.role).toBe('Owner');
  });

  it('should validate active session via /api/v1/auth/me', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'carol@market.com',
        password: 'Password123!',
        firstName: 'Carol',
        lastName: 'Danvers',
        businessName: 'Carol Market',
      });

    const cookies = reg.headers['set-cookie'];

    const meRes = await request(app)
      .get('/api/v1/auth/me')
      .set('Cookie', cookies);

    expect(meRes.status).toBe(200);
    expect(meRes.body.success).toBe(true);
    expect(meRes.body.data.user.email).toBe('carol@market.com');
    expect(meRes.body.data.currentBusiness.name).toBe('Carol Market');
    expect(meRes.body.data.membership.role).toBe('Owner');
    expect(meRes.body.data.membership.permissions.length).toBeGreaterThan(0);
  });

  it('should clear cookies upon logout', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'dave@store.com',
        password: 'Password123!',
        firstName: 'Dave',
        lastName: 'Bautista',
        businessName: 'Dave Store',
      });

    const logoutRes = await request(app)
      .post('/api/v1/auth/logout')
      .set('Cookie', reg.headers['set-cookie']);

    expect(logoutRes.status).toBe(200);
    const cookies = logoutRes.headers['set-cookie'];
    expect(cookies.some((c: string) => c.includes('access_token=;') || c.includes('Max-Age=0'))).toBe(true);
  });

  it('should support forgot password and reset password flow', async () => {
    await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'reset_test@store.com',
        password: 'OldPassword123!',
        firstName: 'Reset',
        lastName: 'User',
        businessName: 'Reset Store',
      });

    // 1. Request Reset
    const forgotRes = await request(app)
      .post('/api/v1/auth/forgot-password')
      .send({ email: 'reset_test@store.com' });

    expect(forgotRes.status).toBe(200);
    const resetToken = forgotRes.body.data.resetToken;
    expect(resetToken).toBeDefined();

    // 2. Confirm Reset
    const resetRes = await request(app)
      .post('/api/v1/auth/reset-password')
      .send({
        token: resetToken,
        newPassword: 'NewPassword999!',
      });

    expect(resetRes.status).toBe(200);

    // 3. Verify Login with New Password
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'reset_test@store.com',
        password: 'NewPassword999!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
  });
});
