import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Party } from '../src/core/parties/party.model.js';
import { User } from '../src/core/identity/user.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('7. Universal People and Relationship Layer (Customers & Suppliers)', () => {
  it('should create, edit, view, add notes, record transactions, and archive a Customer', async () => {
    // 1. Register Business Owner
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'store_owner@retail.com',
        password: 'Password123!',
        firstName: 'Sarah',
        lastName: 'Connor',
        businessName: 'Cyberdyne Retail',
      });
    const cookie = reg.headers['set-cookie'];
    const tenantId = reg.body.data.tenant.id;

    // 2. Create Individual Customer
    const createRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'INDIVIDUAL',
        roles: ['CUSTOMER'],
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1 (555) 123-4567',
        billingAddress: {
          street: '123 Elm Street',
          city: 'Springfield',
          state: 'IL',
          postalCode: '62701',
          country: 'US',
        },
        customerDetails: {
          creditLimit: 500,
          paymentTermsDays: 30,
        },
        initialNote: 'VIP repeat customer referred by Mike.',
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.displayName).toBe('John Doe');
    expect(createRes.body.data.roles).toContain('CUSTOMER');
    expect(createRes.body.data.notes.length).toBe(1);
    expect(createRes.body.data.notes[0].content).toBe('VIP repeat customer referred by Mike.');

    const customerId = createRes.body.data._id;

    // 3. Edit Customer
    const updateRes = await request(app)
      .patch(`/api/v1/customers/${customerId}`)
      .set('Cookie', cookie)
      .send({
        phone: '+1 (555) 999-8888',
        customerDetails: {
          creditLimit: 1000,
        },
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.phone).toBe('+1 (555) 999-8888');
    expect(updateRes.body.data.customerDetails.creditLimit).toBe(1000);

    // 4. Add Additional Note
    const noteRes = await request(app)
      .post(`/api/v1/customers/${customerId}/notes`)
      .set('Cookie', cookie)
      .send({ content: 'Customer requested electronic PDF receipts only.' });

    expect(noteRes.status).toBe(200);
    expect(noteRes.body.data.notes.length).toBe(2);

    // 5. Record Invoice (Customer owes business)
    const invoiceRes = await request(app)
      .post(`/api/v1/customers/${customerId}/transactions`)
      .set('Cookie', cookie)
      .send({
        type: 'INVOICE',
        amount: 250,
        currency: 'USD',
        description: 'Invoice for order #ORD-1049',
      });

    expect(invoiceRes.status).toBe(200);
    expect(invoiceRes.body.data.customerDetails.currentBalance).toBe(250);
    expect(invoiceRes.body.data.customerDetails.totalSpend).toBe(250);
    expect(invoiceRes.body.data.transactions.length).toBe(1);

    // 6. Record Partial Payment (Customer pays $100)
    const paymentRes = await request(app)
      .post(`/api/v1/customers/${customerId}/transactions`)
      .set('Cookie', cookie)
      .send({
        type: 'PAYMENT',
        amount: 100,
        currency: 'USD',
        description: 'Cash payment towards #ORD-1049',
      });

    expect(paymentRes.status).toBe(200);
    expect(paymentRes.body.data.customerDetails.currentBalance).toBe(150); // 250 - 100 = 150

    // 7. Filter: Query customers who owe you money (hasBalance=true)
    const owingRes = await request(app)
      .get('/api/v1/customers?hasBalance=true')
      .set('Cookie', cookie);

    expect(owingRes.status).toBe(200);
    expect(owingRes.body.data.length).toBe(1);
    expect(owingRes.body.data[0]._id).toBe(customerId);

    // 8. Archive Customer
    const archiveRes = await request(app)
      .patch(`/api/v1/customers/${customerId}/archive`)
      .set('Cookie', cookie);

    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.isArchived).toBe(true);

    // 9. Verify Customer is excluded from active list by default
    const activeList = await request(app)
      .get('/api/v1/customers')
      .set('Cookie', cookie);

    expect(activeList.body.data.length).toBe(0);

    // 10. Restore Customer
    const restoreRes = await request(app)
      .patch(`/api/v1/customers/${customerId}/restore`)
      .set('Cookie', cookie);

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.isArchived).toBe(false);
  });

  it('should support unified Multi-Role entity (same Organization as Customer AND Supplier without duplication)', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'trader@nexus.com',
        password: 'Password123!',
        firstName: 'Tom',
        lastName: 'Trader',
        businessName: 'Nexus Global',
      });
    const cookie = reg.headers['set-cookie'];

    // 1. Create Organization with dual roles: CUSTOMER & SUPPLIER
    const createRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['CUSTOMER', 'SUPPLIER'],
        companyName: 'ABC Trading & Distribution Ltd',
        taxNumber: 'VAT-992813',
        email: 'orders@abctrading.com',
        phone: '+1 (800) 555-0199',
        customerDetails: { creditLimit: 5000 },
        supplierDetails: { defaultPaymentTermsDays: 45 },
      });

    expect(createRes.status).toBe(201);
    const sharedId = createRes.body.data._id;
    expect(createRes.body.data.displayName).toBe('ABC Trading & Distribution Ltd');

    // 2. Query Customers API -> Must include ABC Trading
    const customerList = await request(app)
      .get('/api/v1/customers')
      .set('Cookie', cookie);

    expect(customerList.body.data.some((c: any) => c._id === sharedId)).toBe(true);

    // 3. Query Suppliers API -> Must include the EXACT SAME record ID
    const supplierList = await request(app)
      .get('/api/v1/suppliers')
      .set('Cookie', cookie);

    expect(supplierList.body.data.some((s: any) => s._id === sharedId)).toBe(true);

    // 4. Verify Single Database Document (zero duplication)
    const countInDb = await Party.countDocuments({ companyName: 'ABC Trading & Distribution Ltd' });
    expect(countInDb).toBe(1);
  });

  it('should enforce strict tenant isolation for customer and supplier records', async () => {
    // Tenant 1
    const reg1 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 't1@corp.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'One',
        businessName: 'Tenant One Corp',
      });
    const cookie1 = reg1.headers['set-cookie'];

    const cust1 = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie1)
      .send({
        type: 'INDIVIDUAL',
        roles: ['CUSTOMER'],
        firstName: 'Secret',
        lastName: 'CustomerOne',
        email: 'secret1@tenant1.com',
      });
    const cust1Id = cust1.body.data._id;

    // Tenant 2
    const reg2 = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 't2@corp.com',
        password: 'Password123!',
        firstName: 'User',
        lastName: 'Two',
        businessName: 'Tenant Two Corp',
      });
    const cookie2 = reg2.headers['set-cookie'];

    // Tenant 2 tries to GET Tenant 1's customer -> MUST BE 404 (or isolated)
    const crossGet = await request(app)
      .get(`/api/v1/customers/${cust1Id}`)
      .set('Cookie', cookie2);

    expect(crossGet.status).toBe(404);

    // Tenant 2 tries to list customers -> Empty list
    const crossList = await request(app)
      .get('/api/v1/customers')
      .set('Cookie', cookie2);

    expect(crossList.body.data.length).toBe(0);

    // Tenant 2 tries to edit Tenant 1's customer -> MUST BE 404
    const crossEdit = await request(app)
      .patch(`/api/v1/customers/${cust1Id}`)
      .set('Cookie', cookie2)
      .send({ firstName: 'Hacked' });

    expect(crossEdit.status).toBe(404);
  });

  it('should enforce RBAC permissions (e.g. Cashier cannot access Suppliers)', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'director@store.com',
        password: 'Password123!',
        firstName: 'Diana',
        lastName: 'Director',
        businessName: 'Diana Department Store',
      });
    const ownerCookie = reg.headers['set-cookie'];
    const tenantId = reg.body.data.tenant.id;

    // Create Cashier user
    const cashierHash = await bcrypt.hash('CashierPass123!', 10);
    await User.create({
      email: 'clerk@store.com',
      passwordHash: cashierHash,
      firstName: 'Chris',
      lastName: 'Clerk',
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

    const cashierLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'clerk@store.com', password: 'CashierPass123!' });
    const cashierCookie = cashierLogin.headers['set-cookie'];

    // Cashier CAN read customers (has customers:read)
    const custRead = await request(app)
      .get('/api/v1/customers')
      .set('Cookie', cashierCookie);
    expect(custRead.status).toBe(200);

    // Cashier CANNOT read suppliers (missing suppliers:read) -> MUST BE 403
    const supRead = await request(app)
      .get('/api/v1/suppliers')
      .set('Cookie', cashierCookie);
    expect(supRead.status).toBe(403);
    expect(supRead.body.error.code).toBe('FORBIDDEN');
  });

  it('should search across customer name, phone, email, and companyName', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'search_owner@test.com',
        password: 'Password123!',
        firstName: 'Sam',
        lastName: 'Search',
        businessName: 'Search Store',
      });
    const cookie = reg.headers['set-cookie'];

    await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'INDIVIDUAL',
        roles: ['CUSTOMER'],
        firstName: 'Alexander',
        lastName: 'Hamilton',
        email: 'alex.hamilton@treasury.gov',
        phone: '202-555-0182',
      });

    await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['CUSTOMER'],
        companyName: 'Acme Mega Corp',
        email: 'purchasing@acmemega.com',
        phone: '415-555-0921',
      });

    // 1. Search by First Name
    const s1 = await request(app)
      .get('/api/v1/customers?search=Alexander')
      .set('Cookie', cookie);
    expect(s1.body.data.length).toBe(1);
    expect(s1.body.data[0].displayName).toBe('Alexander Hamilton');

    // 2. Search by Phone snippet
    const s2 = await request(app)
      .get('/api/v1/customers?search=0921')
      .set('Cookie', cookie);
    expect(s2.body.data.length).toBe(1);
    expect(s2.body.data[0].displayName).toBe('Acme Mega Corp');

    // 3. Search by Email domain
    const s3 = await request(app)
      .get('/api/v1/customers?search=treasury.gov')
      .set('Cookie', cookie);
    expect(s3.body.data.length).toBe(1);
    expect(s3.body.data[0].displayName).toBe('Alexander Hamilton');
  });
});
