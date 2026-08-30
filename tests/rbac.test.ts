import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/core/identity/user.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('3. Role-Based Access Control (RBAC)', () => {
  it('should enforce backend permissions per role and reject unauthorized access', async () => {
    // 1. Register Owner
    const regOwner = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'boss@enterprise.com',
        password: 'Password123!',
        firstName: 'Boss',
        lastName: 'Owner',
        businessName: 'Enterprise Hub',
      });

    const ownerCookie = regOwner.headers['set-cookie'];
    const tenantId = regOwner.body.data.tenant.id;

    // 2. Create a Cashier User directly in DB
    const cashierHash = await bcrypt.hash('CashierPass123!', 10);
    const cashierUser = await User.create({
      email: 'cashier@enterprise.com',
      passwordHash: cashierHash,
      firstName: 'Carl',
      lastName: 'Cashier',
      memberships: [
        {
          tenantId: new mongoose.Types.ObjectId(tenantId),
          role: 'Cashier',
          status: 'ACTIVE',
        },
      ],
      currentTenantId: new mongoose.Types.ObjectId(tenantId),
      isActive: true,
    });

    // 3. Login as Cashier
    const cashierLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'cashier@enterprise.com',
        password: 'CashierPass123!',
      });
    const cashierCookie = cashierLogin.headers['set-cookie'];

    // 4. Cashier tries to access Business Settings (requires tenant:settings) -> MUST FAIL (403)
    const forbiddenSettings = await request(app)
      .patch('/api/v1/business/settings')
      .set('Cookie', cashierCookie)
      .send({ receiptHeader: 'Hacked Header' });

    expect(forbiddenSettings.status).toBe(403);
    expect(forbiddenSettings.body.success).toBe(false);
    expect(forbiddenSettings.body.error.code).toBe('FORBIDDEN');

    // 5. Cashier tries to invite users (requires users:invite) -> MUST FAIL (403)
    const forbiddenInvite = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', cashierCookie)
      .send({
        email: 'newbie@enterprise.com',
        firstName: 'New',
        lastName: 'Guy',
        role: 'Staff',
      });

    expect(forbiddenInvite.status).toBe(403);

    // 6. Owner tries the same operations -> MUST SUCCEED (200 / 201)
    const allowedSettings = await request(app)
      .patch('/api/v1/business/settings')
      .set('Cookie', ownerCookie)
      .send({ receiptHeader: 'Official Header' });

    expect(allowedSettings.status).toBe(200);
    expect(allowedSettings.body.success).toBe(true);

    const allowedInvite = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', ownerCookie)
      .send({
        email: 'manager@enterprise.com',
        firstName: 'Mandy',
        lastName: 'Manager',
        role: 'Manager',
      });

    expect(allowedInvite.status).toBe(201);
    expect(allowedInvite.body.success).toBe(true);
  });
});
