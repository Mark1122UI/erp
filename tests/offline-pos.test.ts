import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { OfflinePOSManager } from '../src/client/offline-pos-manager.js';
import { Sale } from '../src/core/sales/sale.model.js';
import { InventoryItem } from '../src/core/inventory/inventory.model.js';

describe('19. Offline-Capable Retail POS (Local Cache, Barcode Index, Queue, Idempotency & Sync)', () => {
  it('should seed offline catalog, handle offline checkouts, sync batches idempotently, and protect stock levels', async () => {
    // 1. Register Owner
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'pos.manager@bazaar.com',
        password: 'Password123!',
        firstName: 'Tariq',
        lastName: 'Bazaar',
        businessName: 'Grand Central Bazaar',
      });
    const cookie = regRes.headers['set-cookie'];

    // 2. Setup Store Location & Stocked Products
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Downtown Bazaar Store', code: 'BAZ-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // Product 1: Artisanal Coffee
    const prod1Res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Organic Ethiopian Yirgacheffe 1kg',
        sku: 'COF-ETH-1KG',
        sellingPrice: 32.0,
        costPrice: 18.0,
        barcodes: [{ barcode: '8901234567890', symbology: 'EAN13' }],
      });
    const prod1Id = prod1Res.body.data._id;

    // Product 2: Ceramic Pour-Over Mug
    const prod2Res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Handcrafted Ceramic Mug',
        sku: 'MUG-CER-01',
        sellingPrice: 15.0,
        costPrice: 6.0,
        barcodes: [{ barcode: '8901234567891', symbology: 'EAN13' }],
      });
    const prod2Id = prod2Res.body.data._id;

    // Add Initial Stock: 100 Coffee, 50 Mugs
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prod1Id, transactionType: 'PURCHASE', quantityDelta: 100 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prod2Id, transactionType: 'PURCHASE', quantityDelta: 50 });

    // -------------------------------------------------------------
    // STEP 1: FETCH OFFLINE MANIFEST & SEED LOCAL POS MANAGER
    // -------------------------------------------------------------
    const manifestRes = await request(app)
      .get('/api/v1/pos/offline-manifest')
      .set('Cookie', cookie);

    expect(manifestRes.status).toBe(200);
    const manifest = manifestRes.body.data;
    expect(manifest.products.length).toBeGreaterThanOrEqual(2);
    expect(manifest.barcodeMap['8901234567890']).toBeDefined();
    expect(manifest.barcodeMap['8901234567890'].name).toBe('Organic Ethiopian Yirgacheffe 1kg');

    // Initialize Client Offline POS Manager
    const clientPos = new OfflinePOSManager();
    clientPos.seedManifest(manifest);

    expect(clientPos.getStatusBadge().status).toBe('ONLINE');

    // -------------------------------------------------------------
    // STEP 2: SIMULATE INTERNET DISCONNECTION & OFFLINE SALES
    // -------------------------------------------------------------
    clientPos.isOnline = false;
    expect(clientPos.getStatusBadge().status).toBe('OFFLINE');
    expect(clientPos.getStatusBadge().message).toBe(
      'Offline — Sales will sync automatically when connection returns.'
    );

    // Offline Sale 1: Look up by Barcode -> Scan Coffee (2 qty @ $32 = $64)
    const scan1 = clientPos.barcodeIndex.lookup('8901234567890');
    expect(scan1).toBeDefined();
    const prod1Local = clientPos.catalog.getById(scan1!.productId);
    clientPos.cart.addItem(prod1Local!, 2);

    expect(clientPos.cart.calculateTotals().grandTotal).toBe(64.0);

    const offlineSale1 = clientPos.checkoutOffline({
      locationId,
      customerName: 'Alice Walk-in',
      payments: [{ paymentMethod: 'CASH', amount: 64.0, tenderedAmount: 70.0, changeAmount: 6.0 }],
      notes: 'Offline Morning Rush Sale #1',
    });

    expect(offlineSale1.offlineSaleId).toBeDefined();
    expect(clientPos.queue.count()).toBe(1);

    // Offline Sale 2: Scan Mug (1 qty @ $15) + 1 Coffee ($32) = $47
    const scan2 = clientPos.barcodeIndex.lookup('8901234567891');
    const prod2Local = clientPos.catalog.getById(scan2!.productId);
    clientPos.cart.addItem(prod2Local!, 1);
    clientPos.cart.addItem(prod1Local!, 1);

    expect(clientPos.cart.calculateTotals().grandTotal).toBe(47.0);

    const offlineSale2 = clientPos.checkoutOffline({
      locationId,
      customerName: 'Bob Walk-in',
      payments: [{ paymentMethod: 'CARD', amount: 47.0, reference: 'OFF-CARD-AUTH-882' }],
      notes: 'Offline Morning Rush Sale #2',
    });

    expect(offlineSale2.offlineSaleId).toBeDefined();
    expect(clientPos.queue.count()).toBe(2);

    // -------------------------------------------------------------
    // STEP 3: RECONNECT INTERNET & TRIGGER IDEMPOTENT SYNC
    // -------------------------------------------------------------
    clientPos.isOnline = true;
    expect(clientPos.getStatusBadge().status).toBe('ONLINE');

    // Perform Sync via API
    const syncResult = await clientPos.syncWithServer(async (queuedSales) => {
      const res = await request(app)
        .post('/api/v1/pos/offline-sync')
        .set('Cookie', cookie)
        .send(queuedSales);
      return res.body.data;
    });

    expect(syncResult.synced.length).toBe(2);
    expect(syncResult.duplicatesSkipped.length).toBe(0);
    expect(syncResult.failed.length).toBe(0);
    expect(clientPos.queue.count()).toBe(0); // Queue drained on success!

    // Verify Sales exist in database
    const sale1InDb = await Sale.findOne({ clientReferenceId: offlineSale1.offlineSaleId });
    expect(sale1InDb).toBeDefined();
    expect(sale1InDb?.grandTotal).toBe(64.0);
    expect(sale1InDb?.status).toBe('PAID');
    expect(sale1InDb?.offlineSyncedAt).toBeDefined();

    const sale2InDb = await Sale.findOne({ clientReferenceId: offlineSale2.offlineSaleId });
    expect(sale2InDb).toBeDefined();
    expect(sale2InDb?.grandTotal).toBe(47.0);
    expect(sale2InDb?.status).toBe('PAID');

    // Verify Inventory Deductions:
    // Initial: 100 Coffee, 50 Mugs
    // Sold: 2 + 1 = 3 Coffee, 1 Mug
    // Remaining: 97 Coffee, 49 Mugs
    const stockCoffee = await InventoryItem.findOne({ locationId, productId: prod1Id });
    expect(stockCoffee?.quantityOnHand).toBe(97);

    const stockMug = await InventoryItem.findOne({ locationId, productId: prod2Id });
    expect(stockMug?.quantityOnHand).toBe(49);

    // -------------------------------------------------------------
    // STEP 4: DUPLICATE SYNC ATTEMPT (IDEMPOTENCY VERIFICATION)
    // -------------------------------------------------------------
    // If a client or background task replays the exact same offline batch:
    const duplicateReplay = await request(app)
      .post('/api/v1/pos/offline-sync')
      .set('Cookie', cookie)
      .send([offlineSale1, offlineSale2]);

    expect(duplicateReplay.status).toBe(200);
    expect(duplicateReplay.body.data.synced.length).toBe(0);
    expect(duplicateReplay.body.data.duplicatesSkipped.length).toBe(2);
    expect(duplicateReplay.body.data.duplicatesSkipped[0].saleId).toBe(sale1InDb?.id);
    expect(duplicateReplay.body.data.duplicatesSkipped[1].saleId).toBe(sale2InDb?.id);

    // Crucial check: Stock must NOT have been decremented again!
    const stockCoffeeAfterReplay = await InventoryItem.findOne({ locationId, productId: prod1Id });
    expect(stockCoffeeAfterReplay?.quantityOnHand).toBe(97); // Still 97!
  });

  it('should enforce strict tenant isolation for offline sync operations', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerA_pos@co.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A POS Hub',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerB_pos@co.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B POS Hub',
      });
    const cookieB = regB.headers['set-cookie'];

    // Tenant A creates Location & Product
    const locA = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookieA)
      .send({ name: 'Location A', code: 'LOC-A' });
    const locAId = locA.body.data._id;

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Product A Secret', sku: 'PROD-A-SEC', sellingPrice: 100 });
    const prodAId = prodA.body.data._id;

    // Tenant B attempts to sync offline sale using Tenant A's location and product
    const unauthorizedSync = await request(app)
      .post('/api/v1/pos/offline-sync')
      .set('Cookie', cookieB)
      .send([
        {
          offlineSaleId: 'unauth_sale_999',
          locationId: locAId,
          customerName: 'Intruder',
          items: [{ productId: prodAId, name: 'Product A Secret', sku: 'PROD-A-SEC', quantity: 1, unitPrice: 100 }],
          payments: [{ paymentMethod: 'CASH', amount: 100 }],
        },
      ]);

    expect(unauthorizedSync.status).toBe(200);
    expect(unauthorizedSync.body.data.failed.length).toBe(1); // Fails because Tenant B does not own Location A or Product A
  });
});
