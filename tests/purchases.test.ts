import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { PurchaseOrder, GoodsReceipt, SupplierBill } from '../src/core/purchasing/purchase.model.js';
import { InventoryTransaction } from '../src/core/inventory/inventory.model.js';
import { Party } from '../src/core/parties/party.model.js';
import mongoose from 'mongoose';

describe('11. Purchasing Core, Purchase Orders, Goods Receipt, Supplier Bills & Payments', () => {
  it('should create PO (without pre-increasing stock), receive stock, generate bill, and track supplier balance', async () => {
    // 1. Register Merchant
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'purchaser@depot.com',
        password: 'Password123!',
        firstName: 'Paul',
        lastName: 'Procurement',
        businessName: 'Procurement Central Ltd',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Supplier
    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', cookie)
      .send({
        companyName: 'Global Microchips Corp',
        type: 'ORGANIZATION',
        roles: ['SUPPLIER'],
        email: 'sales@microchips.com',
      });
    expect(suppRes.status).toBe(201);
    const supplierId = suppRes.body.data._id;

    // 3. Create Product
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'ARM Microcontroller IC',
        sku: 'MCU-ARM-32',
        sellingPrice: 12.0,
        costPrice: 4.5,
      });
    const productId = prodRes.body.data._id;

    // 4. Create Store Location
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Factory Depot', code: 'FACT-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // 5. Create Purchase Order for 100 units @ $4.50 = $450
    const poRes = await request(app)
      .post('/api/v1/purchases/orders')
      .set('Cookie', cookie)
      .send({
        supplierId,
        locationId,
        items: [{ productId, orderedQuantity: 100, unitCost: 4.5 }],
        notes: 'Urgent chip delivery for assembly line',
      });

    expect(poRes.status).toBe(201);
    expect(poRes.body.success).toBe(true);
    expect(poRes.body.data.status).toBe('ORDERED');
    expect(poRes.body.data.grandTotal).toBe(450.0);
    const poId = poRes.body.data._id;

    // CRITICAL RULE CHECK: Stock must NOT increase before receiving
    let stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    let stockItem = stockList.body.data.find((i: any) => i.productId === productId);
    expect(stockItem.quantityOnHand).toBe(0);

    // 6. Receive Partial Stock: 60 units
    const receive1 = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookie)
      .send({
        purchaseOrderId: poId,
        items: [{ productId, quantityReceived: 60, unitCost: 4.5 }],
        supplierInvoiceNumber: 'INV-CHIP-991',
      });

    expect(receive1.status).toBe(201);
    expect(receive1.body.data.goodsReceipt.receiptNumber).toMatch(/^GRN-/);
    expect(receive1.body.data.bill.totalAmount).toBe(270.0); // 60 * 4.50 = $270
    expect(receive1.body.data.bill.dueAmount).toBe(270.0);

    const bill1Id = receive1.body.data.bill._id;

    // Verify PO status is PARTIALLY_RECEIVED
    const poCheck = await request(app).get(`/api/v1/purchases/orders/${poId}`).set('Cookie', cookie);
    expect(poCheck.body.data.status).toBe('PARTIALLY_RECEIVED');
    expect(poCheck.body.data.items[0].receivedQuantity).toBe(60);

    // Verify Stock increased to 60 with PURCHASE transaction
    stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(stockList.body.data.find((i: any) => i.productId === productId).quantityOnHand).toBe(60);

    // Verify Supplier Account Payable Balance is $270
    let supplierCheck = await request(app).get(`/api/v1/suppliers/${supplierId}`).set('Cookie', cookie);
    expect(supplierCheck.body.data.supplierDetails.currentBalance).toBe(270.0);
    expect(supplierCheck.body.data.supplierDetails.totalPurchased).toBe(270.0);

    // 7. Make Partial Payment of $100 against Bill
    const payRes1 = await request(app)
      .post(`/api/v1/purchases/bills/${bill1Id}/pay`)
      .set('Cookie', cookie)
      .send({
        amount: 100.0,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'WIRE-889901',
      });

    expect(payRes1.status).toBe(200);
    expect(payRes1.body.data.status).toBe('PARTIALLY_PAID');
    expect(payRes1.body.data.paidAmount).toBe(100.0);
    expect(payRes1.body.data.dueAmount).toBe(170.0);

    // Supplier balance reduced to $170
    supplierCheck = await request(app).get(`/api/v1/suppliers/${supplierId}`).set('Cookie', cookie);
    expect(supplierCheck.body.data.supplierDetails.currentBalance).toBe(170.0);

    // 8. Pay remaining $170 to settle Bill fully
    const payRes2 = await request(app)
      .post(`/api/v1/purchases/bills/${bill1Id}/pay`)
      .set('Cookie', cookie)
      .send({
        amount: 170.0,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'WIRE-889902',
      });

    expect(payRes2.status).toBe(200);
    expect(payRes2.body.data.status).toBe('PAID');
    expect(payRes2.body.data.dueAmount).toBe(0);

    // Supplier balance settled ($0.00)
    supplierCheck = await request(app).get(`/api/v1/suppliers/${supplierId}`).set('Cookie', cookie);
    expect(supplierCheck.body.data.supplierDetails.currentBalance).toBe(0);

    // 9. Receive Remaining 40 units -> PO status becomes RECEIVED
    const receive2 = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookie)
      .send({
        purchaseOrderId: poId,
        items: [{ productId, quantityReceived: 40, unitCost: 4.5 }],
      });

    expect(receive2.status).toBe(201);
    const poFinal = await request(app).get(`/api/v1/purchases/orders/${poId}`).set('Cookie', cookie);
    expect(poFinal.body.data.status).toBe('RECEIVED');
    expect(poFinal.body.data.items[0].receivedQuantity).toBe(100);

    // Total stock on hand is now 100
    stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(stockList.body.data.find((i: any) => i.productId === productId).quantityOnHand).toBe(100);
  });

  it('should enforce tenant isolation for purchasing and bills', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'buyerA@corp.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'BuyerA',
        businessName: 'Business A Purchases',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'buyerB@corp.com',
        password: 'Password123!',
        firstName: 'Betty',
        lastName: 'BuyerB',
        businessName: 'Business B Purchases',
      });
    const cookieB = regB.headers['set-cookie'];

    const suppA = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', cookieA)
      .send({ companyName: 'Vendor A', type: 'ORGANIZATION', roles: ['SUPPLIER'] });

    expect(suppA.status).toBe(201);

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Product A', sku: 'PROD-A', sellingPrice: 20 });

    const poA = await request(app)
      .post('/api/v1/purchases/orders')
      .set('Cookie', cookieA)
      .send({
        supplierId: suppA.body.data._id,
        items: [{ productId: prodA.body.data._id, orderedQuantity: 10, unitCost: 10 }],
      });
    const poAId = poA.body.data._id;

    // Tenant B attempts to fetch Tenant A's PO
    const getResB = await request(app)
      .get(`/api/v1/purchases/orders/${poAId}`)
      .set('Cookie', cookieB);
    expect(getResB.status).toBe(404);

    // Tenant B attempts to receive stock for Tenant A's PO
    const receiveB = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookieB)
      .send({
        purchaseOrderId: poAId,
        items: [{ productId: prodA.body.data._id, quantityReceived: 10 }],
      });
    expect(receiveB.status).toBe(404);
  });
});
