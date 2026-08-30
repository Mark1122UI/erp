import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('5. User Memberships, Invitations & Lifecycle', () => {
  it('should invite a user, accept invitation, change roles, and handle deactivation', async () => {
    // 1. Register Owner
    const regOwner = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'admin@corp.com',
        password: 'Password123!',
        firstName: 'Arthur',
        lastName: 'Admin',
        businessName: 'Corp Hub',
      });
    const ownerCookie = regOwner.headers['set-cookie'];

    // 2. Invite a new Manager
    const inviteRes = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', ownerCookie)
      .send({
        email: 'morgan@corp.com',
        firstName: 'Morgan',
        lastName: 'Manager',
        role: 'Manager',
      });

    expect(inviteRes.status).toBe(201);
    expect(inviteRes.body.success).toBe(true);
    const inviteToken = inviteRes.body.data.invitationToken;
    const invitedUserId = inviteRes.body.data.userId;
    expect(inviteToken).toBeDefined();

    // 3. Invited user accepts the invitation & sets password
    const acceptRes = await request(app)
      .post('/api/v1/users/accept-invitation')
      .send({
        token: inviteToken,
        password: 'MorganPassword123!',
      });

    expect(acceptRes.status).toBe(200);
    expect(acceptRes.body.success).toBe(true);

    // 4. Morgan logs in
    const morganLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'morgan@corp.com',
        password: 'MorganPassword123!',
      });

    expect(morganLogin.status).toBe(200);
    expect(morganLogin.body.data.role).toBe('Manager');

    // 5. Owner updates Morgan's role to Accountant
    const updateRoleRes = await request(app)
      .patch(`/api/v1/users/${invitedUserId}/role`)
      .set('Cookie', ownerCookie)
      .send({ role: 'Accountant' });

    expect(updateRoleRes.status).toBe(200);
    expect(updateRoleRes.body.data.role).toBe('Accountant');

    // 6. Owner deactivates Morgan
    const deactRes = await request(app)
      .patch(`/api/v1/users/${invitedUserId}/status`)
      .set('Cookie', ownerCookie)
      .send({ status: 'DEACTIVATED' });

    expect(deactRes.status).toBe(200);
    expect(deactRes.body.data.status).toBe('DEACTIVATED');

    // 7. Deactivated Morgan attempts login -> MUST BE FORBIDDEN (403)
    const blockedLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'morgan@corp.com',
        password: 'MorganPassword123!',
      });

    expect(blockedLogin.status).toBe(403);

    // 8. Owner tries to demote or deactivate the sole owner -> MUST BE REJECTED (400)
    const ownerProfile = await request(app).get('/api/v1/auth/me').set('Cookie', ownerCookie);
    const ownerUserId = ownerProfile.body.data.user.id;

    const badDemote = await request(app)
      .patch(`/api/v1/users/${ownerUserId}/role`)
      .set('Cookie', ownerCookie)
      .send({ role: 'Staff' });

    expect(badDemote.status).toBe(400);
  });
});
