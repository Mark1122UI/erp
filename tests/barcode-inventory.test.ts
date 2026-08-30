import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { InventoryItem, InventoryTransaction, StockAdjustment, StockTransfer } from '../src/core/inventory/inventory.model.js';
import { StockCount } from '../src/core/inventory/stock-count.model.js';
import mongoose from 'mongoose';

describe('15. Barcode-Driven Inventory Operations (Receiving, Stock Counting, Transfers, Returns)', () => {
  it('Workflow 1: Barcode-Driven Stock Receiving', async () => {
    // 1. Setup Merchant & Store Location
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'receiver@wholesalewarehouse.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'Receiver',
        businessName: 'Apex Wholesale Hub',
      });
    const cookie = reg.headers['set-cookie'];

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Central Warehouse Bay 1', code: 'WH-BAY-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // 2. Create Product with Barcode
    const barcodeRice = '8901234567890';
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Basmati Rice 5kg',
        sku: 'RICE-BAS-5KG',
        sellingPrice: 15.99,
        costPrice: 9.5,
        barcodes: [{ barcode: barcodeRice, symbology: 'EAN13', isPrimary: true }],
      });
    const prodId = prodRes.body.data._id;

    // 3. User scans barcode to find product
    const scanRes = await request(app)
      .get(`/api/v1/pos/search?query=${barcodeRice}&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(scanRes.status).toBe(200);
    expect(scanRes.body.data.length).toBe(1);
    expect(scanRes.body.data[0].id).toBe(prodId);
    expect(scanRes.body.data[0].quantityOnHand).toBe(0);

    // 4. Enter quantity (50 units) and Confirm Stock Receiving
    const receiveRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId: prodId,
        transactionType: 'PURCHASE',
        quantityDelta: 50,
        costPerUnit: 9.5,
        notes: 'Goods received from Supplier Container #44',
      });
    expect(receiveRes.status).toBe(201);
    expect(receiveRes.body.data.balanceAfter).toBe(50);

    // Verify auditable transaction created
    const txDoc = await InventoryTransaction.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      transactionType: 'PURCHASE',
    });
    expect(txDoc).not.toBeNull();
    expect(txDoc?.quantityDelta).toBe(50);
  });

  it('Workflow 2: Barcode-Driven Stock Count (Repeated Scanning & Auto-Reconciliation)', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'auditor@inventorypro.com',
        password: 'Password123!',
        firstName: 'Audrey',
        lastName: 'Auditor',
        businessName: 'Audrey Grocery Pro',
      });
    const cookie = reg.headers['set-cookie'];

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Downtown Store', code: 'DT-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // Create 2 Products
    const barcodeRice = '5012345678900';
    const barcodeSoap = '5012345678917';

    const rice = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Jasmine Rice 5kg',
        sku: 'RICE-JAS-5KG',
        sellingPrice: 12.0,
        costPrice: 7.0,
        barcodes: [{ barcode: barcodeRice, symbology: 'EAN13', isPrimary: true }],
      });
    const riceId = rice.body.data._id;

    const soap = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Organic Lavender Soap',
        sku: 'SOAP-LAV-100',
        sellingPrice: 4.5,
        costPrice: 2.0,
        barcodes: [{ barcode: barcodeSoap, symbology: 'EAN13', isPrimary: true }],
      });
    const soapId = soap.body.data._id;

    // Initial system stock: 15 Rice, 10 Soap
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: riceId, transactionType: 'PURCHASE', quantityDelta: 15 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: soapId, transactionType: 'PURCHASE', quantityDelta: 10 });

    // 1. User starts Stock Count
    const startCountRes = await request(app)
      .post('/api/v1/inventory/counts')
      .set('Cookie', cookie)
      .send({ locationId, notes: 'End of Month Audit' });

    expect(startCountRes.status).toBe(201);
    const countId = startCountRes.body.data._id;
    expect(startCountRes.body.data.status).toBe('IN_PROGRESS');

    // 2. Operator scans Rice repeatedly (e.g. Scan 1, Scan 2, or bulk count +10)
    // Scan 1: Rice +1
    await request(app)
      .post(`/api/v1/inventory/counts/${countId}/scan`)
      .set('Cookie', cookie)
      .send({ barcodeOrSku: barcodeRice, quantity: 1 });

    // Scan 2: Rice +11 (Total counted = 12)
    const scanRice2 = await request(app)
      .post(`/api/v1/inventory/counts/${countId}/scan`)
      .set('Cookie', cookie)
      .send({ barcodeOrSku: barcodeRice, quantity: 11 });

    // Verify Rice was incremented on the SAME line (no duplicate rows)
    const riceLine = scanRice2.body.data.items.find((it: any) => it.productId === riceId);
    expect(riceLine.countedQuantity).toBe(12);
    expect(riceLine.systemQuantity).toBe(15);
    expect(riceLine.difference).toBe(-3); // Physical 12 vs System 15 -> Discrepancy -3

    // Scan Soap: 8 units counted
    const scanSoap = await request(app)
      .post(`/api/v1/inventory/counts/${countId}/scan`)
      .set('Cookie', cookie)
      .send({ barcodeOrSku: barcodeSoap, quantity: 8 });

    const soapLine = scanSoap.body.data.items.find((it: any) => it.productId === soapId);
    expect(soapLine.countedQuantity).toBe(8);
    expect(soapLine.systemQuantity).toBe(10);
    expect(soapLine.difference).toBe(-2); // Physical 8 vs System 10 -> Discrepancy -2

    // 3. Complete Stock Count & Auto-Reconcile
    const completeRes = await request(app)
      .post(`/api/v1/inventory/counts/${countId}/complete`)
      .set('Cookie', cookie);

    expect(completeRes.status).toBe(200);
    expect(completeRes.body.data.status).toBe('COMPLETED');

    // 4. Verify system stock is now updated to match physical count (12 Rice, 8 Soap)
    const riceStock = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(riceId),
      locationId: new mongoose.Types.ObjectId(locationId),
    });
    expect(riceStock?.quantityOnHand).toBe(12);

    const soapStock = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(soapId),
      locationId: new mongoose.Types.ObjectId(locationId),
    });
    expect(soapStock?.quantityOnHand).toBe(8);

    // Verify adjustment transactions exist with PHYSICAL_COUNT reason
    const adjTx = await InventoryTransaction.find({
      locationId: new mongoose.Types.ObjectId(locationId),
      transactionType: 'ADJUSTMENT',
    });
    expect(adjTx.length).toBeGreaterThanOrEqual(2);
  });

  it('Workflow 3: Barcode-Driven Stock Transfer between Locations', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'logistics@superstore.com',
        password: 'Password123!',
        firstName: 'Leo',
        lastName: 'Logistics',
        businessName: 'SuperStore Logistics',
      });
    const cookie = reg.headers['set-cookie'];

    // Create 2 locations: Main Warehouse and Branch 2
    const whRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Central Distribution Center', code: 'CDC-01' });
    const cdcLocId = whRes.body.data._id;

    const branchRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Uptown Branch 2', code: 'BR-02' });
    const branchLocId = branchRes.body.data._id;

    // Create Product with Barcode
    const barcodeSnack = '7612345678901';
    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Almond Energy Bar 50g',
        sku: 'BAR-ALM-50',
        sellingPrice: 2.99,
        costPrice: 1.2,
        barcodes: [{ barcode: barcodeSnack, symbology: 'EAN13' }],
      });
    const prodId = prod.body.data._id;

    // Stock in CDC: 200 units
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId: cdcLocId, productId: prodId, transactionType: 'PURCHASE', quantityDelta: 200 });

    // 1. Scan barcode to resolve product
    const scan = await request(app)
      .get(`/api/v1/pos/search?query=${barcodeSnack}&locationId=${cdcLocId}`)
      .set('Cookie', cookie);
    expect(scan.body.data[0].id).toBe(prodId);

    // 2. Create Transfer for 40 units from CDC to Branch 2
    const transferRes = await request(app)
      .post('/api/v1/inventory/transfers')
      .set('Cookie', cookie)
      .send({
        sourceLocationId: cdcLocId,
        destinationLocationId: branchLocId,
        items: [{ productId: prodId, quantity: 40 }],
        notes: 'Restocking Uptown branch snacks',
      });
    expect(transferRes.status).toBe(201);
    const transferId = transferRes.body.data._id;

    // 3. Dispatch Transfer (removes stock from CDC)
    const dispatchRes = await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/dispatch`)
      .set('Cookie', cookie);
    expect(dispatchRes.status).toBe(200);

    // 4. Receive Transfer at Branch 2 (adds stock to Branch 2)
    const receiveTrfRes = await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/receive`)
      .set('Cookie', cookie);
    expect(receiveTrfRes.status).toBe(200);

    // Verify stock at source is 160 and at destination is 40
    const sourceStock = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      locationId: new mongoose.Types.ObjectId(cdcLocId),
    });
    expect(sourceStock?.quantityOnHand).toBe(160);

    const destStock = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      locationId: new mongoose.Types.ObjectId(branchLocId),
    });
    expect(destStock?.quantityOnHand).toBe(40);
  });

  it('Workflow 4: Barcode-Driven Sales Returns', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'returns@departmentstore.com',
        password: 'Password123!',
        firstName: 'Rita',
        lastName: 'Returns',
        businessName: 'Rita Department Store',
      });
    const cookie = reg.headers['set-cookie'];

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Returns Counter 1', code: 'RET-01' });
    const locationId = locRes.body.data._id;

    // Create product
    const barcodeHeadphones = '8809876543210';
    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Wireless Bluetooth Headphones',
        sku: 'HP-BT-01',
        sellingPrice: 89.99,
        costPrice: 45.0,
        barcodes: [{ barcode: barcodeHeadphones, symbology: 'EAN13' }],
      });
    const prodId = prod.body.data._id;

    // Initial stock: 10 units
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodId, transactionType: 'PURCHASE', quantityDelta: 10 });

    // Sale: Customer buys 2 units
    const saleRes = await request(app)
      .post('/api/v1/pos/checkout')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerName: 'Customer John',
        items: [{ productId: prodId, quantity: 2, unitPrice: 89.99 }],
        payments: [{ amount: 179.98, paymentMethod: 'CARD' }],
      });
    expect(saleRes.status).toBe(201);
    const saleId = saleRes.body.data.sale._id;

    // Stock after sale is 8
    const stockAfterSale = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      locationId: new mongoose.Types.ObjectId(locationId),
    });
    expect(stockAfterSale?.quantityOnHand).toBe(8);

    // 1. Customer returns 1 headphone. Cashier scans barcode to resolve product
    const scanReturn = await request(app)
      .get(`/api/v1/pos/search?query=${barcodeHeadphones}&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(scanReturn.body.data[0].id).toBe(prodId);

    // 2. Process Sales Return via Universal Sales Engine
    const returnRes = await request(app)
      .post('/api/v1/sales/returns')
      .set('Cookie', cookie)
      .send({
        originalSaleId: saleId,
        items: [{ productId: prodId, quantity: 1, returnReason: 'Unopened - customer changed mind' }],
        refundPaymentMethod: 'CASH',
        reason: 'Barcode scanned at return desk',
      });
    expect(returnRes.status).toBe(201);

    // 3. Verify stock is restored to 9 units via immutable RETURN transaction
    const restoredStock = await InventoryItem.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      locationId: new mongoose.Types.ObjectId(locationId),
    });
    expect(restoredStock?.quantityOnHand).toBe(9);

    const returnTx = await InventoryTransaction.findOne({
      productId: new mongoose.Types.ObjectId(prodId),
      transactionType: 'RETURN',
    });
    expect(returnTx).not.toBeNull();
    expect(returnTx?.quantityDelta).toBe(1);
  });
});
