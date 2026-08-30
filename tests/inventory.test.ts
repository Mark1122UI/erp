import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { InventoryItem, InventoryTransaction, Location, StockAdjustment, StockTransfer } from '../src/core/inventory/inventory.model.js';
import mongoose from 'mongoose';

describe('9. Transaction-Based Inventory Core, Multi-Location, Transfers & Adjustments', () => {
  it('should handle Purchase, Sale, and Return stock movementsDeriving accurate ledger balances', async () => {
    // 1. Register Business Owner
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'inventory_mgr@supply.com',
        password: 'Password123!',
        firstName: 'Ivan',
        lastName: 'Inventory',
        businessName: 'Global Supply Depot',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Product
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Industrial Safety Helmet',
        sku: 'HELMET-IND-01',
        sellingPrice: 45.0,
        costPrice: 20.0,
      });
    const productId = prodRes.body.data._id;

    // 3. Create Main Warehouse Location
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({
        name: 'Central Warehouse',
        code: 'CENTRAL-WH',
        type: 'WAREHOUSE',
        isDefault: true,
      });
    const locationId = locRes.body.data._id;

    // 4. Record Initial Purchase: +100 units
    const purchaseRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'PURCHASE',
        quantityDelta: 100,
        costPerUnit: 20.0,
        referenceType: 'PURCHASE_ORDER',
        referenceId: 'PO-2026-001',
        notes: 'Initial bulk shipment received',
      });

    expect(purchaseRes.status).toBe(201);
    expect(purchaseRes.body.data.quantityDelta).toBe(100);
    expect(purchaseRes.body.data.balanceAfter).toBe(100);

    // Verify stock level
    let stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    let itemStock = stockList.body.data.find((i: any) => i.productId === productId);
    expect(itemStock.quantityOnHand).toBe(100);

    // 5. Record Sale: -15 units
    const saleRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'SALE',
        quantityDelta: -15,
        referenceType: 'SALE_INVOICE',
        referenceId: 'INV-1001',
      });

    expect(saleRes.status).toBe(201);
    expect(saleRes.body.data.quantityDelta).toBe(-15);
    expect(saleRes.body.data.balanceAfter).toBe(85);

    // 6. Record Customer Return: +2 units
    const returnRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'RETURN',
        quantityDelta: 2,
        referenceType: 'SALE_RETURN',
        referenceId: 'RET-001',
      });

    expect(returnRes.status).toBe(201);
    expect(returnRes.body.data.quantityDelta).toBe(2);
    expect(returnRes.body.data.balanceAfter).toBe(87);

    // 7. Verify in Database: 3 immutable transactions recorded
    const transactions = await InventoryTransaction.find({
      productId: new mongoose.Types.ObjectId(productId),
    }).sort({ createdAt: 1 });

    expect(transactions.length).toBe(3);
    expect(transactions[0].transactionType).toBe('PURCHASE');
    expect(transactions[1].transactionType).toBe('SALE');
    expect(transactions[2].transactionType).toBe('RETURN');
  });

  it('should enforce negative stock prevention rule', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'oversell_guard@store.com',
        password: 'Password123!',
        firstName: 'Oscar',
        lastName: 'Oversell',
        businessName: 'Oversell Defense Store',
      });
    const cookie = reg.headers['set-cookie'];

    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Limited Edition Watch',
        sku: 'WATCH-LTD-01',
        sellingPrice: 299.0,
      });
    const productId = prodRes.body.data._id;

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Flagship Store', code: 'FLAGSHIP-01' });
    const locationId = locRes.body.data._id;

    // Stock on hand is 0. Attempting to sell 1 item must fail
    const oversellRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'SALE',
        quantityDelta: -1,
      });

    expect(oversellRes.status).toBe(400);
    expect(oversellRes.body.success).toBe(false);
    expect(oversellRes.body.error.message).toContain('Insufficient stock');
  });

  it('should execute stock adjustments with auditable reasons', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'auditor@warehouse.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'Auditor',
        businessName: 'Audit Logistics',
      });
    const cookie = reg.headers['set-cookie'];

    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Ceramic Floor Tiles Box',
        sku: 'TILE-CER-BOX',
        sellingPrice: 35.0,
      });
    const productId = prodRes.body.data._id;

    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Tiles Yard', code: 'YARD-01' });
    const locationId = locRes.body.data._id;

    // Set opening stock: 50
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'OPENING_BALANCE',
        quantityDelta: 50,
      });

    // Stock adjustment: Physical cycle count found 47 (3 broken/damaged)
    const adjRes = await request(app)
      .post('/api/v1/inventory/adjustments')
      .set('Cookie', cookie)
      .send({
        locationId,
        reason: 'DAMAGED_EXPIRED',
        notes: '3 boxes cracked in transit',
        items: [{ productId, newQuantity: 47 }],
      });

    expect(adjRes.status).toBe(201);
    expect(adjRes.body.success).toBe(true);
    expect(adjRes.body.data.adjustmentNumber).toMatch(/^ADJ-/);
    expect(adjRes.body.data.items[0].deltaQty).toBe(-3);

    // Verify stock is now 47
    const stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    const itemStock = stockList.body.data.find((i: any) => i.productId === productId);
    expect(itemStock.quantityOnHand).toBe(47);
  });

  it('should execute multi-location stock transfer without double counting', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'transfer_mgr@retail.com',
        password: 'Password123!',
        firstName: 'Tom',
        lastName: 'Transfer',
        businessName: 'Multi-Branch Retail Group',
      });
    const cookie = reg.headers['set-cookie'];

    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Organic Espresso Beans 1kg',
        sku: 'COFFEE-ESP-1KG',
        sellingPrice: 22.0,
      });
    const productId = prodRes.body.data._id;

    // Create Warehouse (Source) & Store (Destination)
    const whRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Central Warehouse', code: 'WH-MAIN', type: 'WAREHOUSE' });
    const warehouseId = whRes.body.data._id;

    const storeRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Downtown Cafe & Store', code: 'STORE-DT', type: 'STORE' });
    const storeId = storeRes.body.data._id;

    // Receive 100 bags at Central Warehouse
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId: warehouseId,
        productId,
        transactionType: 'PURCHASE',
        quantityDelta: 100,
      });

    // 1. Create Stock Transfer: 20 bags from Warehouse to Store
    const createTrf = await request(app)
      .post('/api/v1/inventory/transfers')
      .set('Cookie', cookie)
      .send({
        sourceLocationId: warehouseId,
        destinationLocationId: storeId,
        notes: 'Replenishing Downtown Cafe stock',
        items: [{ productId, quantity: 20 }],
      });

    expect(createTrf.status).toBe(201);
    const transferId = createTrf.body.data._id;

    // 2. Dispatch Transfer (TRANSFER_OUT from Warehouse)
    const dispatchRes = await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/dispatch`)
      .set('Cookie', cookie);

    expect(dispatchRes.status).toBe(200);
    expect(dispatchRes.body.data.status).toBe('TRANSFERRED_OUT');

    // Warehouse stock reduced to 80; Store stock still 0 (in transit)
    let whStock = await request(app).get(`/api/v1/inventory/stock?locationId=${warehouseId}`).set('Cookie', cookie);
    let dtStock = await request(app).get(`/api/v1/inventory/stock?locationId=${storeId}`).set('Cookie', cookie);
    expect(whStock.body.data.find((i: any) => i.productId === productId).quantityOnHand).toBe(80);
    expect(dtStock.body.data.find((i: any) => i.productId === productId).quantityOnHand).toBe(0);

    // 3. Receive Transfer (TRANSFER_IN to Store)
    const receiveRes = await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/receive`)
      .set('Cookie', cookie);

    expect(receiveRes.status).toBe(200);
    expect(receiveRes.body.data.status).toBe('COMPLETED');

    // Store stock is now 20
    dtStock = await request(app).get(`/api/v1/inventory/stock?locationId=${storeId}`).set('Cookie', cookie);
    expect(dtStock.body.data.find((i: any) => i.productId === productId).quantityOnHand).toBe(20);
  });

  it('should enforce strict tenant isolation for inventory and locations', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantA_inv@hub.com',
        password: 'Password123!',
        firstName: 'Arthur',
        lastName: 'A',
        businessName: 'Business A',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantB_inv@hub.com',
        password: 'Password123!',
        firstName: 'Brenda',
        lastName: 'B',
        businessName: 'Business B',
      });
    const cookieB = regB.headers['set-cookie'];

    // Tenant A creates product & location
    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Item A', sku: 'ITEM-A', sellingPrice: 10 });
    const locA = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookieA)
      .send({ name: 'Location A', code: 'LOC-A' });

    // Tenant B attempts to record a stock movement targeting Tenant A's location/product
    const hijackAttempt = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookieB)
      .send({
        locationId: locA.body.data._id,
        productId: prodA.body.data._id,
        transactionType: 'PURCHASE',
        quantityDelta: 50,
      });

    expect(hijackAttempt.status).toBe(404);
    expect(hijackAttempt.body.success).toBe(false);
  });
});
