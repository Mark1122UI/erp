import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product, ProductBarcode } from '../src/core/catalog/product.model.js';
import { User } from '../src/core/identity/user.model.js';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

describe('8. Universal Product Catalog, Barcodes & CSV Import Engine', () => {
  it('should create a product with multiple barcodes, categories, and pricing', async () => {
    // 1. Register Owner
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'merchant@beverages.com',
        password: 'Password123!',
        firstName: 'Marcus',
        lastName: 'Merchant',
        businessName: 'Global Beverage Hub',
      });
    const cookie = reg.headers['set-cookie'];
    const tenantId = reg.body.data.tenant.id;

    // 2. Create Product with Multiple Barcodes (EAN, UPC, Internal)
    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Coca Cola 500ml Can',
        sku: 'COCA-500-CAN',
        description: 'Standard 500ml aluminium can',
        brand: 'Coca Cola',
        categoryName: 'Beverages',
        unit: 'CAN',
        costPrice: 0.65,
        sellingPrice: 1.5,
        reorderPoint: 24,
        barcodes: [
          { barcode: '5449000000996', symbology: 'EAN13', isPrimary: true, description: 'European EAN Barcode' },
          { barcode: '049000028904', symbology: 'UPC_A', isPrimary: false, description: 'US UPC Barcode' },
          { barcode: 'INT-COKE-500', symbology: 'INTERNAL', isPrimary: false, description: 'Warehouse Quick-Scan' },
        ],
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.success).toBe(true);
    expect(createRes.body.data.name).toBe('Coca Cola 500ml Can');
    expect(createRes.body.data.sku).toBe('COCA-500-CAN');
    expect(createRes.body.data.sellingPrice).toBe(1.5);

    const productId = createRes.body.data._id;

    // 3. Verify Product Details endpoint retrieves all 3 barcodes
    const getRes = await request(app)
      .get(`/api/v1/products/${productId}`)
      .set('Cookie', cookie);

    expect(getRes.status).toBe(200);
    expect(getRes.body.data.barcodes.length).toBe(3);
    const barcodeValues = getRes.body.data.barcodes.map((b: any) => b.barcode);
    expect(barcodeValues).toContain('5449000000996');
    expect(barcodeValues).toContain('049000028904');
    expect(barcodeValues).toContain('INT-COKE-500');

    // 4. Verify in database: Separate ProductBarcode documents created
    const dbBarcodes = await ProductBarcode.find({ productId: new mongoose.Types.ObjectId(productId) });
    expect(dbBarcodes.length).toBe(3);
  });

  it('should reject duplicate SKU within the same tenant', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'sku_tester@store.com',
        password: 'Password123!',
        firstName: 'Sam',
        lastName: 'SKU',
        businessName: 'SKU Store',
      });
    const cookie = reg.headers['set-cookie'];

    // 1. Create first product with SKU 'TSHIRT-BLK-L'
    const p1 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Cotton T-Shirt Black L',
        sku: 'TSHIRT-BLK-L',
        sellingPrice: 19.99,
      });
    expect(p1.status).toBe(201);

    // 2. Attempt creating another product with the same SKU
    const p2 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'V-Neck T-Shirt Black Large',
        sku: 'tshirt-blk-l', // Case-insensitive collision
        sellingPrice: 22.0,
      });

    expect(p2.status).toBe(409);
    expect(p2.body.success).toBe(false);
    expect(p2.body.error.code).toBe('CONFLICT');
  });

  it('should reject duplicate barcode within the same tenant', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'barcode_tester@store.com',
        password: 'Password123!',
        firstName: 'Ben',
        lastName: 'Barcode',
        businessName: 'Barcode Store',
      });
    const cookie = reg.headers['set-cookie'];

    // 1. Create Product A with barcode '778899112233'
    await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Energy Drink 250ml',
        sku: 'ENERGY-250',
        sellingPrice: 2.5,
        barcodes: [{ barcode: '778899112233', symbology: 'EAN13' }],
      });

    // 2. Attempt creating Product B with the SAME barcode '778899112233'
    const p2 = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Energy Drink Sugar Free',
        sku: 'ENERGY-250-SF',
        sellingPrice: 2.5,
        barcodes: [{ barcode: '778899112233', symbology: 'EAN13' }],
      });

    expect(p2.status).toBe(409);
    expect(p2.body.success).toBe(false);
    expect(p2.body.error.message).toContain('already registered');
  });

  it('should allow same SKU and barcode across different tenants (Multi-Tenant Isolation)', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerA@storeA.com',
        password: 'Password123!',
        firstName: 'Adam',
        lastName: 'A',
        businessName: 'Store A',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerB@storeB.com',
        password: 'Password123!',
        firstName: 'Betty',
        lastName: 'B',
        businessName: 'Store B',
      });
    const cookieB = regB.headers['set-cookie'];

    // Both tenants create a universal product with identical SKU and EAN barcode
    const resA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({
        name: 'Nutella 750g',
        sku: 'NUTELLA-750',
        sellingPrice: 6.99,
        barcodes: [{ barcode: '3017620425035', symbology: 'EAN13' }],
      });
    expect(resA.status).toBe(201);

    const resB = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieB)
      .send({
        name: 'Nutella Hazelnut Spread 750g',
        sku: 'NUTELLA-750',
        sellingPrice: 7.25,
        barcodes: [{ barcode: '3017620425035', symbology: 'EAN13' }],
      });
    expect(resB.status).toBe(201);

    // Tenant A queries list -> only sees own Nutella ($6.99)
    const listA = await request(app).get('/api/v1/products').set('Cookie', cookieA);
    expect(listA.body.data.length).toBe(1);
    expect(listA.body.data[0].sellingPrice).toBe(6.99);

    // Tenant B queries list -> only sees own Nutella ($7.25)
    const listB = await request(app).get('/api/v1/products').set('Cookie', cookieB);
    expect(listB.body.data.length).toBe(1);
    expect(listB.body.data[0].sellingPrice).toBe(7.25);
  });

  it('should search products by name, SKU, brand, and barcode', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'search_pro@shop.com',
        password: 'Password123!',
        firstName: 'Peter',
        lastName: 'Product',
        businessName: 'Search Mega Shop',
      });
    const cookie = reg.headers['set-cookie'];

    await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Wireless Bluetooth Mouse',
        sku: 'LOGI-M185',
        brand: 'Logitech',
        sellingPrice: 15.0,
        barcodes: [{ barcode: '5099206028821' }],
      });

    // 1. Search by SKU
    const sSku = await request(app).get('/api/v1/products?search=M185').set('Cookie', cookie);
    expect(sSku.body.data.length).toBe(1);
    expect(sSku.body.data[0].sku).toBe('LOGI-M185');

    // 2. Search by Brand
    const sBrand = await request(app).get('/api/v1/products?search=Logitech').set('Cookie', cookie);
    expect(sBrand.body.data.length).toBe(1);

    // 3. Search by Barcode scanner input
    const sBarcode = await request(app).get('/api/v1/products?search=5099206028821').set('Cookie', cookie);
    expect(sBarcode.body.data.length).toBe(1);
    expect(sBarcode.body.data[0].name).toBe('Wireless Bluetooth Mouse');
  });

  it('should validate CSV import and reject invalid rows with informative error diagnostics', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'importer@warehouse.com',
        password: 'Password123!',
        firstName: 'Ian',
        lastName: 'Import',
        businessName: 'Import Warehouse',
      });
    const cookie = reg.headers['set-cookie'];

    // 1. Attempt importing with invalid rows (missing SKU, negative price, duplicate barcode inside CSV)
    const badImport = await request(app)
      .post('/api/v1/products/import')
      .set('Cookie', cookie)
      .send({
        rows: [
          { name: 'Product Good 1', sku: 'GOOD-01', sellingPrice: 10.0, barcode: 'BC-001' },
          { name: 'Product Bad 2 (no sku)', sku: '', sellingPrice: 12.0 },
          { name: 'Product Bad 3 (negative price)', sku: 'BAD-03', sellingPrice: -5.0 },
          { name: 'Product Bad 4 (duplicate barcode)', sku: 'BAD-04', sellingPrice: 20.0, barcode: 'BC-001' },
        ],
      });

    expect(badImport.status).toBe(400);
    expect(badImport.body.success).toBe(false);
    expect(badImport.body.error.code).toBe('IMPORT_VALIDATION_FAILED');
    expect(badImport.body.error.details.length).toBeGreaterThanOrEqual(3);

    // 2. Perform Clean Valid Batch Import
    const goodImport = await request(app)
      .post('/api/v1/products/import')
      .set('Cookie', cookie)
      .send({
        rows: [
          { name: 'Imported Item Alpha', sku: 'IMP-ALPHA', sellingPrice: 14.5, costPrice: 8.0, barcode: 'IMP-BC-001', categoryName: 'Hardware' },
          { name: 'Imported Item Beta', sku: 'IMP-BETA', sellingPrice: 29.99, costPrice: 15.0, barcode: 'IMP-BC-002', categoryName: 'Tools' },
        ],
      });

    expect(goodImport.status).toBe(201);
    expect(goodImport.body.success).toBe(true);
    expect(goodImport.body.data.importedCount).toBe(2);

    // 3. Verify in database
    const listRes = await request(app).get('/api/v1/products').set('Cookie', cookie);
    expect(listRes.body.data.length).toBe(2);
  });

  it('should archive and restore products', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'archivist@store.com',
        password: 'Password123!',
        firstName: 'Archie',
        lastName: 'Archive',
        businessName: 'Archive Store',
      });
    const cookie = reg.headers['set-cookie'];

    const createRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Seasonal Pumpkin Latte',
        sku: 'LATTE-PUMPKIN',
        sellingPrice: 4.5,
      });
    const productId = createRes.body.data._id;

    // Archive
    const archiveRes = await request(app)
      .patch(`/api/v1/products/${productId}/archive`)
      .set('Cookie', cookie);
    expect(archiveRes.status).toBe(200);
    expect(archiveRes.body.data.isArchived).toBe(true);

    // Excluded from default list
    const activeList = await request(app).get('/api/v1/products').set('Cookie', cookie);
    expect(activeList.body.data.length).toBe(0);

    // Visible in archived list
    const archivedList = await request(app).get('/api/v1/products?isArchived=true').set('Cookie', cookie);
    expect(archivedList.body.data.length).toBe(1);

    // Restore
    const restoreRes = await request(app)
      .patch(`/api/v1/products/${productId}/restore`)
      .set('Cookie', cookie);
    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.isArchived).toBe(false);
  });
});
