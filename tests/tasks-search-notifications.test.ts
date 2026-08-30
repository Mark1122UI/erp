import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Task } from '../src/core/tasks/task.model.js';
import { Notification } from '../src/core/notifications/notification.model.js';
import mongoose from 'mongoose';

describe('17. Universal Tasks, Centralized Notifications & Global Cross-Entity Search', () => {
  it('should manage tasks with entity relations, trigger assignee notifications, and power global cross-entity search', async () => {
    // 1. Register Owner & Secondary User
    const regOwner = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'founder@nexuscorp.com',
        password: 'Password123!',
        firstName: 'Nadia',
        lastName: 'Nexus',
        businessName: 'Nexus Global Logistics',
      });
    const ownerCookie = regOwner.headers['set-cookie'];
    const ownerId = regOwner.body.data.user.id;

    // Invite Staff Member into Nexus Global Logistics
    const inviteRes = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', ownerCookie)
      .send({
        email: 'staff@nexuscorp.com',
        firstName: 'Sam',
        lastName: 'Staff',
        role: 'Staff',
      });
    expect(inviteRes.status).toBe(201);
    const inviteToken = inviteRes.body.data.invitationToken;
    const staffId = inviteRes.body.data.userId;

    // Staff accepts invitation & logs in
    await request(app)
      .post('/api/v1/users/accept-invitation')
      .send({
        token: inviteToken,
        password: 'Password123!',
      });

    const staffLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'staff@nexuscorp.com',
        password: 'Password123!',
      });
    expect(staffLogin.status).toBe(200);
    const staffCookie = staffLogin.headers['set-cookie'];

    // 2. Setup Location & Products
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', ownerCookie)
      .send({ name: 'Nexus Hub 1', code: 'NEX-01', isDefault: true });
    const locationId = locRes.body.data._id;

    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Quantum Precision Sensor 500',
        sku: 'QNT-SENS-500',
        sellingPrice: 850.0,
        costPrice: 400.0,
        barcodes: [{ barcode: '9876543210987', symbology: 'EAN13' }],
      });
    const productId = prodRes.body.data._id;

    // 3. Create Customer
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', ownerCookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['CUSTOMER'],
        companyName: 'Stark Industries',
        email: 'tony@starkindustries.com',
        phone: '+1 555-4000',
      });
    const customerId = custRes.body.data._id;

    // 4. Create Supplier
    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', ownerCookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['SUPPLIER'],
        companyName: 'Pym Particle Labs',
        email: 'hank@pymlabs.com',
        phone: '+1 555-3000',
      });
    const supplierId = suppRes.body.data._id;

    // Add stock & create a Sale
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', ownerCookie)
      .send({ locationId, productId, transactionType: 'PURCHASE', quantityDelta: 50 });

    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', ownerCookie)
      .send({
        locationId,
        customerId,
        items: [{ productId, quantity: 2, unitPrice: 850.0 }],
        notes: 'Priority delivery for Stark tower',
      });
    const saleId = saleRes.body.data._id;
    const saleNumber = saleRes.body.data.saleNumber;

    // -------------------------------------------------------------
    // TASK ENGINE & NOTIFICATIONS TEST
    // -------------------------------------------------------------
    // Create Task assigned to Staff related to the Customer and Sale
    const createTaskRes = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', ownerCookie)
      .send({
        title: 'Follow up on Quantum Sensor installation with Tony',
        description: 'Verify sensor calibration and schedule technician visit',
        assignedTo: staffId,
        priority: 'HIGH',
        dueDate: new Date(Date.now() + 7 * 86400000).toISOString(),
        relatedEntity: {
          entityType: 'SALE',
          entityId: saleId,
          entityName: saleNumber,
        },
        tags: ['Installation', 'VIP Customer'],
      });

    expect(createTaskRes.status).toBe(201);
    expect(createTaskRes.body.data.taskNumber).toMatch(/^TSK-/);
    expect(createTaskRes.body.data.status).toBe('TODO');
    expect(createTaskRes.body.data.priority).toBe('HIGH');
    const taskId = createTaskRes.body.data._id;

    // Verify Assignee (Staff) received an automated in-app notification!
    const notifRes = await request(app)
      .get('/api/v1/notifications')
      .set('Cookie', staffCookie);

    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data.unreadCount).toBeGreaterThanOrEqual(1);
    const assignedNotif = notifRes.body.data.notifications.find(
      (n: any) => n.type === 'TASK_ASSIGNED'
    );
    expect(assignedNotif).toBeDefined();
    expect(assignedNotif.title).toContain('New Task Assigned');
    expect(assignedNotif.message).toContain('Quantum Sensor');

    // Mark Notification as Read
    const markReadRes = await request(app)
      .patch(`/api/v1/notifications/${assignedNotif._id}/read`)
      .set('Cookie', staffCookie);
    expect(markReadRes.status).toBe(200);
    expect(markReadRes.body.data.isRead).toBe(true);

    // Update Task status to IN_PROGRESS and then COMPLETED
    const updateTaskRes = await request(app)
      .patch(`/api/v1/tasks/${taskId}`)
      .set('Cookie', ownerCookie)
      .send({ status: 'COMPLETED' });

    expect(updateTaskRes.status).toBe(200);
    expect(updateTaskRes.body.data.status).toBe('COMPLETED');
    expect(updateTaskRes.body.data.completedAt).toBeDefined();

    // -------------------------------------------------------------
    // GLOBAL CROSS-ENTITY SEARCH TEST
    // -------------------------------------------------------------
    // Query 1: Search by partial product/task keyword "Quantum"
    const searchQuantum = await request(app)
      .get('/api/v1/search?query=Quantum')
      .set('Cookie', ownerCookie);

    expect(searchQuantum.status).toBe(200);
    const qResults = searchQuantum.body.data;
    expect(qResults.totalCount).toBeGreaterThanOrEqual(2);

    // Verify Grouped by Entity
    expect(qResults.resultsByEntity.products.length).toBeGreaterThanOrEqual(1);
    expect(qResults.resultsByEntity.products[0].title).toBe('Quantum Precision Sensor 500');
    expect(qResults.resultsByEntity.tasks.length).toBeGreaterThanOrEqual(1);
    expect(qResults.resultsByEntity.tasks[0].title).toContain('Quantum Sensor');

    // Query 2: Search by Barcode "9876543210987"
    const searchBarcode = await request(app)
      .get('/api/v1/search?query=9876543210987')
      .set('Cookie', ownerCookie);
    expect(searchBarcode.status).toBe(200);
    expect(searchBarcode.body.data.resultsByEntity.products.length).toBe(1);
    expect(searchBarcode.body.data.resultsByEntity.products[0].title).toBe('Quantum Precision Sensor 500');

    // Query 3: Search by Customer "Stark"
    const searchStark = await request(app)
      .get('/api/v1/search?query=Stark')
      .set('Cookie', ownerCookie);
    expect(searchStark.status).toBe(200);
    expect(searchStark.body.data.resultsByEntity.customers.length).toBe(1);
    expect(searchStark.body.data.resultsByEntity.customers[0].title).toBe('Stark Industries');
    expect(searchStark.body.data.resultsByEntity.sales.length).toBe(1); // Sale for Stark Industries

    // Query 4: Search by Supplier "Pym"
    const searchPym = await request(app)
      .get('/api/v1/search?query=Pym')
      .set('Cookie', ownerCookie);
    expect(searchPym.status).toBe(200);
    expect(searchPym.body.data.resultsByEntity.suppliers.length).toBe(1);
    expect(searchPym.body.data.resultsByEntity.suppliers[0].title).toBe('Pym Particle Labs');
  });

  it('should enforce strict tenant isolation for tasks, notifications, and global search', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantA_search@co.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A Secure Hub',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantB_search@co.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B Secure Hub',
      });
    const cookieB = regB.headers['set-cookie'];

    // Create Secret Task & Product in Tenant A
    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Classified Stealth Drone X9', sku: 'DRONE-X9', sellingPrice: 50000 });

    const taskA = await request(app)
      .post('/api/v1/tasks')
      .set('Cookie', cookieA)
      .send({ title: 'Top Secret Stealth Drone Flight Test', priority: 'URGENT' });
    const taskAId = taskA.body.data._id;

    // Tenant B searches for "Stealth Drone"
    const searchB = await request(app)
      .get('/api/v1/search?query=Stealth')
      .set('Cookie', cookieB);

    expect(searchB.status).toBe(200);
    expect(searchB.body.data.totalCount).toBe(0);
    expect(searchB.body.data.resultsByEntity.products.length).toBe(0);
    expect(searchB.body.data.resultsByEntity.tasks.length).toBe(0);

    // Tenant B attempts to read Tenant A's task
    const readTaskB = await request(app)
      .get(`/api/v1/tasks/${taskAId}`)
      .set('Cookie', cookieB);

    expect(readTaskB.status).toBe(404);
  });
});
