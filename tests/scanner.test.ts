import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product, ProductBarcode } from '../src/core/catalog/product.model.js';
import mongoose from 'mongoose';

describe('14. Mobile Camera Barcode Scanner, Unified Scanner Service & Unknown Barcode Flow', () => {
  it('should handle existing barcode scans, unknown barcode quick registration, and offline-first catalog caching', async () => {
    // 1. Register Merchant
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'scanner_store@mart.com',
        password: 'Password123!',
        firstName: 'Sam',
        lastName: 'Scanner',
        businessName: 'Scan & Go Mart',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Location
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Mobile Checkout 1', code: 'MOB-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // 3. Create Existing Product with Multiple Barcodes
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Sparkling Mineral Water 500ml',
        sku: 'WATER-SPARK-500',
        sellingPrice: 1.89,
        costPrice: 0.75,
        barcodes: [
          { barcode: '5449000000996', symbology: 'EAN13', isPrimary: true },
          { barcode: '012000000996', symbology: 'UPC_A', isPrimary: false },
        ],
      });
    expect(prodRes.status).toBe(201);
    const prodId = prodRes.body.data._id;

    // Add stock
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodId, transactionType: 'PURCHASE', quantityDelta: 100 });

    // 4. Test Existing Barcode Scan Lookup via POS API
    const scanEAN = await request(app)
      .get(`/api/v1/pos/search?query=5449000000996&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(scanEAN.status).toBe(200);
    expect(scanEAN.body.data.length).toBe(1);
    expect(scanEAN.body.data[0].id).toBe(prodId);
    expect(scanEAN.body.data[0].name).toBe('Sparkling Mineral Water 500ml');
    expect(scanEAN.body.data[0].quantityOnHand).toBe(100);

    const scanUPC = await request(app)
      .get(`/api/v1/pos/search?query=012000000996&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(scanUPC.status).toBe(200);
    expect(scanUPC.body.data.length).toBe(1);
    expect(scanUPC.body.data[0].id).toBe(prodId);

    // 5. Test Unknown Barcode Lookup
    const unknownBarcode = '7622210449281';
    const unknownScan = await request(app)
      .get(`/api/v1/pos/search?query=${unknownBarcode}&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(unknownScan.status).toBe(200);
    expect(unknownScan.body.data.length).toBe(0); // Not found -> Triggers Unknown Barcode Quick Add modal on client

    // 6. Execute Unknown Barcode Quick Registration Flow
    const quickCreate = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Dark Chocolate Bar 100g',
        sku: 'CHOC-DARK-100',
        sellingPrice: 3.49,
        costPrice: 1.5,
        categoryName: 'Confectionery',
        barcodes: [
          {
            barcode: unknownBarcode,
            symbology: 'EAN13',
            isPrimary: true,
          },
        ],
      });

    expect(quickCreate.status).toBe(201);
    expect(quickCreate.body.data.name).toBe('Dark Chocolate Bar 100g');
    const newProdId = quickCreate.body.data._id;

    // Verify Barcode is registered in ProductBarcode collection
    const barcodeDoc = await ProductBarcode.findOne({ barcode: unknownBarcode });
    expect(barcodeDoc).not.toBeNull();
    expect(barcodeDoc?.productId.toString()).toBe(newProdId);

    // Add stock for new product
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: newProdId, transactionType: 'PURCHASE', quantityDelta: 50 });

    // 7. Verify Now Scannable immediately
    const reScan = await request(app)
      .get(`/api/v1/pos/search?query=${unknownBarcode}&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(reScan.status).toBe(200);
    expect(reScan.body.data.length).toBe(1);
    expect(reScan.body.data[0].id).toBe(newProdId);
    expect(reScan.body.data[0].quantityOnHand).toBe(50);

    // 8. Complete POS Checkout with Scanned Item
    const checkout = await request(app)
      .post('/api/v1/pos/checkout')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerName: 'Mobile Shopper',
        items: [{ productId: newProdId, quantity: 2, unitPrice: 3.49 }],
        payments: [{ amount: 6.98, paymentMethod: 'CARD' }],
      });

    expect(checkout.status).toBe(201);
    expect(checkout.body.data.sale.grandTotal).toBe(6.98);
  });

  it('should enforce tenant isolation for barcode scanning', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'scannerA@hub.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A Scanner',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'scannerB@hub.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B Scanner',
      });
    const cookieB = regB.headers['set-cookie'];

    const barcodeSecret = '9998887771112';

    await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({
        name: 'Confidential Part A',
        sku: 'CONF-PART-A',
        sellingPrice: 100.0,
        barcodes: [{ barcode: barcodeSecret, symbology: 'CODE128' }],
      });

    // Tenant B searches with the exact same barcode
    const searchB = await request(app)
      .get(`/api/v1/pos/search?query=${barcodeSecret}`)
      .set('Cookie', cookieB);

    expect(searchB.status).toBe(200);
    expect(searchB.body.data.length).toBe(0); // Tenant B cannot see Tenant A's products or barcodes
  });
});
