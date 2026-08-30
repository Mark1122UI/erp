import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sale, SalesReturn } from '../src/core/sales/sale.model.js';
import { InventoryTransaction } from '../src/core/inventory/inventory.model.js';
import mongoose from 'mongoose';

describe('10. Universal Sales Engine, Safe Money Math, Inventory Reductions, Receipts & Returns', () => {
  it('should process a direct sale, auto-deduct inventory, and record payment with safe financial totals', async () => {
    // 1. Register Merchant
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'sales_boss@store.com',
        password: 'Password123!',
        firstName: 'Sally',
        lastName: 'Sales',
        businessName: 'Apex Electronics & Retail',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Products
    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'USB-C Fast Charging Cable',
        sku: 'CABLE-USBC-2M',
        sellingPrice: 19.99,
        costPrice: 6.5,
        isTaxable: true,
        taxRatePercent: 10, // 10% tax
      });
    const prodAId = prodA.body.data._id;

    const prodB = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Wireless Earbuds Pro',
        sku: 'EARBUD-PRO-01',
        sellingPrice: 89.99,
        costPrice: 35.0,
        isTaxable: true,
        taxRatePercent: 10,
      });
    const prodBId = prodB.body.data._id;

    // 3. Create Store Location & Add Initial Stock
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Retail Store 1', code: 'STORE-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // Stock up: 50 cables, 20 earbuds
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 50 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodBId, transactionType: 'PURCHASE', quantityDelta: 20 });

    // 4. Create Direct Sale (2 Cables @ $19.99, 1 Earbud @ $89.99, $5 item discount on earbuds)
    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerName: 'Alice Walk-in',
        items: [
          { productId: prodAId, quantity: 2 },
          { productId: prodBId, quantity: 1, discountAmount: 5.0 },
        ],
        payments: [
          {
            amount: 137.47,
            paymentMethod: 'CASH',
            tenderedAmount: 150.0,
            changeAmount: 12.53,
          },
        ],
      });

    expect(saleRes.status).toBe(201);
    expect(saleRes.body.success).toBe(true);
    expect(saleRes.body.data.status).toBe('PAID');
    expect(saleRes.body.data.subtotal).toBe(129.97);
    expect(saleRes.body.data.discountTotal).toBe(5.0);
    expect(saleRes.body.data.taxTotal).toBe(12.5);
    expect(saleRes.body.data.grandTotal).toBe(137.47);
    expect(saleRes.body.data.paidAmount).toBe(137.47);
    expect(saleRes.body.data.dueAmount).toBe(0);

    const saleId = saleRes.body.data._id;

    // 5. Verify Automatic Inventory Deduction
    const stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);

    const stockA = stockList.body.data.find((i: any) => i.productId === prodAId);
    const stockB = stockList.body.data.find((i: any) => i.productId === prodBId);
    expect(stockA.quantityOnHand).toBe(48); // 50 - 2
    expect(stockB.quantityOnHand).toBe(19); // 20 - 1

    // Verify Inventory Transactions logged
    const invTx = await InventoryTransaction.find({
      referenceId: saleRes.body.data.saleNumber,
    });
    expect(invTx.length).toBe(2);
    expect(invTx[0].transactionType).toBe('SALE');
    expect(invTx[0].quantityDelta).toBe(-2);

    // 6. Verify Printable Receipt Endpoint
    const receiptRes = await request(app)
      .get(`/api/v1/sales/${saleId}/receipt`)
      .set('Cookie', cookie);

    expect(receiptRes.status).toBe(200);
    expect(receiptRes.body.data.business.name).toBe('Apex Electronics & Retail');
    expect(receiptRes.body.data.sale.grandTotal).toBe(137.47);
    expect(receiptRes.body.data.sale.payments[0].tenderedAmount).toBe(150.0);
    expect(receiptRes.body.data.sale.payments[0].changeAmount).toBe(12.53);
  });

  it('should process a sales return, restore inventory, and issue refund record', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'returns_mgr@store.com',
        password: 'Password123!',
        firstName: 'Robert',
        lastName: 'Return',
        businessName: 'Return Depot',
      });
    const cookie = reg.headers['set-cookie'];

    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Desk Lamp LED',
        sku: 'LAMP-LED-01',
        sellingPrice: 30.0,
      });
    const prodId = prod.body.data._id;

    // Create Location
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Depot Store', code: 'DEPOT-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // Stock up: 10 units
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId: prodId,
        transactionType: 'PURCHASE',
        quantityDelta: 10,
      });

    // Make Sale of 3 lamps ($90 total)
    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerName: 'John Customer',
        items: [{ productId: prodId, quantity: 3 }],
        payments: [{ amount: 90.0, paymentMethod: 'CARD' }],
      });
    const saleId = saleRes.body.data._id;

    // Inventory is now 7
    let stock = await request(app).get(`/api/v1/inventory/stock?locationId=${locationId}`).set('Cookie', cookie);
    expect(stock.body.data.find((i: any) => i.productId === prodId).quantityOnHand).toBe(7);

    // 1. Process Return of 1 lamp
    const returnRes = await request(app)
      .post('/api/v1/sales/returns')
      .set('Cookie', cookie)
      .send({
        originalSaleId: saleId,
        items: [{ productId: prodId, quantity: 1 }],
        refundPaymentMethod: 'CARD',
        reason: 'Customer changed mind',
      });

    expect(returnRes.status).toBe(201);
    expect(returnRes.body.success).toBe(true);
    expect(returnRes.body.data.totalRefundAmount).toBe(30.0);
    expect(returnRes.body.data.returnNumber).toMatch(/^RET-/);

    // 2. Inventory is restored from 7 back to 8
    stock = await request(app).get(`/api/v1/inventory/stock?locationId=${locationId}`).set('Cookie', cookie);
    expect(stock.body.data.find((i: any) => i.productId === prodId).quantityOnHand).toBe(8);

    // 3. Original Sale marked as REFUNDED
    const updatedSale = await request(app).get(`/api/v1/sales/${saleId}`).set('Cookie', cookie);
    expect(updatedSale.body.data.status).toBe('REFUNDED');
  });

  it('should reject invalid returns where returned quantity exceeds original purchase', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'fraud_guard@store.com',
        password: 'Password123!',
        firstName: 'Frank',
        lastName: 'FraudGuard',
        businessName: 'Secure Retailers',
      });
    const cookie = reg.headers['set-cookie'];

    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({ name: 'Gaming Keyboard', sku: 'KB-GAME-01', sellingPrice: 60.0 });
    const prodId = prod.body.data._id;

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Secure Store', code: 'SEC-01', isDefault: true });
    const locationId = locRes.body.data._id;

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId: prodId,
        transactionType: 'PURCHASE',
        quantityDelta: 10,
      });

    // Buy 2 keyboards
    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        locationId,
        items: [{ productId: prodId, quantity: 2 }],
        payments: [{ amount: 120.0, paymentMethod: 'CASH' }],
      });
    const saleId = saleRes.body.data._id;

    // Attempt returning 5 keyboards (only 2 were purchased)
    const badReturn = await request(app)
      .post('/api/v1/sales/returns')
      .set('Cookie', cookie)
      .send({
        originalSaleId: saleId,
        items: [{ productId: prodId, quantity: 5 }],
      });

    expect(badReturn.status).toBe(400);
    expect(badReturn.body.success).toBe(false);
    expect(badReturn.body.error.message).toContain('Cannot return');
  });

  it('should enforce tenant isolation for sales', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'salesA@hub.com',
        password: 'Password123!',
        firstName: 'Alex',
        lastName: 'A',
        businessName: 'Business Sales A',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'salesB@hub.com',
        password: 'Password123!',
        firstName: 'Bella',
        lastName: 'B',
        businessName: 'Business Sales B',
      });
    const cookieB = regB.headers['set-cookie'];

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Product A', sku: 'PROD-A', sellingPrice: 50.0 });
    const prodAId = prodA.body.data._id;

    const locA = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookieA)
      .send({ name: 'Location A', code: 'LOC-A', isDefault: true });
    const locAId = locA.body.data._id;

    // Stock up in Tenant A
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookieA)
      .send({ locationId: locAId, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 10 });

    const saleA = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookieA)
      .send({
        locationId: locAId,
        items: [{ productId: prodAId, quantity: 1 }],
      });

    expect(saleA.status).toBe(201);
    const saleAId = saleA.body.data._id;

    // Tenant B attempts to fetch Tenant A's sale
    const getResB = await request(app)
      .get(`/api/v1/sales/${saleAId}`)
      .set('Cookie', cookieB);

    expect(getResB.status).toBe(404);
  });
});
