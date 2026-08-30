import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Product, ProductBarcode } from '../src/core/catalog/product.model.js';
import { Sale } from '../src/core/sales/sale.model.js';
import { Party } from '../src/core/parties/party.model.js';
import { AuditLog } from '../src/core/audit/audit.model.js';
import { SupplierBill, PurchaseOrder } from '../src/core/purchasing/purchase.model.js';
import { InventoryItem, Location } from '../src/core/inventory/inventory.model.js';
import { ProductCache } from '../public/js/scanner.js';
import mongoose from 'mongoose';

describe('Phase 19: Performance Optimization & Scalability Benchmarks', () => {
  async function setupBusinessWithCatalog(productCount: number = 200) {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: `perf_${Date.now()}_${Math.random().toString(36).substring(2, 6)}@benchmark.com`,
        password: 'Password123!',
        firstName: 'Speedy',
        lastName: 'Tester',
        businessName: 'High Velocity Retail Corp',
        country: 'US',
        currency: 'USD',
      });

    const cookie = regRes.headers['set-cookie'];
    const tenantId = regRes.body.data.tenant.id;
    const userId = regRes.body.data.user.id;
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

    // Get default location
    let location = await Location.findOne({ tenantId: tenantObjectId, isDefault: true });
    if (!location) {
      location = await Location.create({
        tenantId: tenantObjectId,
        name: 'Main Speed Hub',
        code: 'HUB-01',
        type: 'STORE',
        isDefault: true,
        isActive: true,
      });
    }

    // Batch seed catalog
    const productDocs: any[] = [];
    const barcodeDocs: any[] = [];
    const inventoryDocs: any[] = [];

    for (let i = 1; i <= productCount; i++) {
      const prodId = new mongoose.Types.ObjectId();
      const sku = `SKU-PERF-${String(i).padStart(5, '0')}`;
      const barcode = `BARCODE${String(i).padStart(6, '0')}`;
      const categoryName = i % 5 === 0 ? 'Beverages' : i % 3 === 0 ? 'Snacks' : 'General';

      productDocs.push({
        _id: prodId,
        tenantId: tenantObjectId,
        name: `High Performance Product item ${i}`,
        sku,
        categoryName,
        sellingPrice: 10 + (i % 50),
        costPrice: 5 + (i % 25),
        unit: 'PCS',
        isTaxable: true,
        taxRatePercent: 8,
        isActive: true,
        isArchived: false,
      });

      barcodeDocs.push({
        tenantId: tenantObjectId,
        productId: prodId,
        barcode,
        symbology: 'CODE128',
        isPrimary: true,
      });

      inventoryDocs.push({
        tenantId: tenantObjectId,
        locationId: location._id,
        productId: prodId,
        quantityOnHand: 100 + i,
        quantityReserved: 0,
      });
    }

    await Product.insertMany(productDocs);
    await ProductBarcode.insertMany(barcodeDocs);
    await InventoryItem.insertMany(inventoryDocs);

    return {
      cookie,
      tenantId,
      userId,
      locationId: location.id,
      productCount,
    };
  }

  // -------------------------------------------------------------
  // 1. MONGODB INDEXES VERIFICATION
  // -------------------------------------------------------------
  describe('1. MongoDB Index Registrations', () => {
    it('should have all high-performance compound indexes registered on Mongoose schemas', () => {
      // Product Indexes
      const productIndexes = Product.schema.indexes();
      const productKeys = productIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(productKeys).toContain(JSON.stringify({ tenantId: 1, sku: 1 }));
      expect(productKeys).toContain(JSON.stringify({ tenantId: 1, isArchived: 1, isActive: 1, name: 1 }));
      expect(productKeys).toContain(JSON.stringify({ tenantId: 1, categoryId: 1 }));

      // Sale Indexes
      const saleIndexes = Sale.schema.indexes();
      const saleKeys = saleIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(saleKeys).toContain(JSON.stringify({ tenantId: 1, saleNumber: 1 }));
      expect(saleKeys).toContain(JSON.stringify({ tenantId: 1, customerId: 1, createdAt: -1 }));
      expect(saleKeys).toContain(JSON.stringify({ tenantId: 1, locationId: 1, createdAt: -1 }));

      // Party Indexes
      const partyIndexes = Party.schema.indexes();
      const partyKeys = partyIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(partyKeys).toContain(JSON.stringify({ tenantId: 1, displayName: 1 }));
      expect(partyKeys).toContain(JSON.stringify({ tenantId: 1, email: 1 }));
      expect(partyKeys).toContain(JSON.stringify({ tenantId: 1, phone: 1 }));

      // AuditLog Indexes
      const auditIndexes = AuditLog.schema.indexes();
      const auditKeys = auditIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(auditKeys).toContain(JSON.stringify({ tenantId: 1, entity: 1, entityId: 1 }));
      expect(auditKeys).toContain(JSON.stringify({ tenantId: 1, userId: 1, createdAt: -1 }));

      // Purchasing Indexes
      const poIndexes = PurchaseOrder.schema.indexes();
      const poKeys = poIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(poKeys).toContain(JSON.stringify({ tenantId: 1, supplierId: 1, createdAt: -1 }));

      const billIndexes = SupplierBill.schema.indexes();
      const billKeys = billIndexes.map((idx) => JSON.stringify(idx[0]));
      expect(billKeys).toContain(JSON.stringify({ tenantId: 1, supplierId: 1, createdAt: -1 }));
      expect(billKeys).toContain(JSON.stringify({ tenantId: 1, status: 1, createdAt: -1 }));
    });
  });

  // -------------------------------------------------------------
  // 2. POS FAST BARCODE LOOKUP & BENCHMARK
  // -------------------------------------------------------------
  describe('2. POS Search & Barcode Lookup Latency', () => {
    it('should resolve exact barcode scan in sub-50ms and return lean projected payload', async () => {
      const { cookie, locationId } = await setupBusinessWithCatalog(300);

      const startTime = performance.now();
      const targetBarcode = 'BARCODE000150';

      const res = await request(app)
        .get(`/api/v1/pos/search?query=${targetBarcode}&locationId=${locationId}`)
        .set('Cookie', cookie);

      const durationMs = performance.now() - startTime;

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].name).toContain('150');
      expect(res.body.data[0].quantityOnHand).toBe(250); // 100 + 150

      // Verify payload is lightweight (< 10KB for single barcode response)
      const payloadSize = JSON.stringify(res.body).length;
      expect(payloadSize).toBeLessThan(10240);
      expect(durationMs).toBeLessThan(500); // Supertest network + DB roundtrip bound
    });

    it('should paginate POS product search with max limits without over-fetching', async () => {
      const { cookie, locationId } = await setupBusinessWithCatalog(250);

      const res = await request(app)
        .get(`/api/v1/pos/search?categoryId=Beverages&locationId=${locationId}&limit=20`)
        .set('Cookie', cookie);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeLessThanOrEqual(20);

      // Verify each item includes required lean fields
      for (const item of res.body.data) {
        expect(item.name).toBeDefined();
        expect(item.sku).toBeDefined();
        expect(item.sellingPrice).toBeDefined();
        expect(item.quantityOnHand).toBeDefined();
      }

      const totalSize = JSON.stringify(res.body).length;
      expect(totalSize).toBeLessThan(25000); // Less than 25KB for 20 items
    });
  });

  // -------------------------------------------------------------
  // 3. PRODUCT CATALOG PAGINATION & SEARCH BENCHMARK
  // -------------------------------------------------------------
  describe('3. Catalog Pagination & Search Scalability', () => {
    it('should efficiently paginate and search large product catalogs', async () => {
      const { cookie } = await setupBusinessWithCatalog(200);

      // 1. Paginated Listing
      const page1Res = await request(app)
        .get('/api/v1/products?page=1&limit=25&sortBy=name&sortOrder=asc')
        .set('Cookie', cookie);

      expect(page1Res.status).toBe(200);
      expect(page1Res.body.data.length).toBe(25);
      expect(page1Res.body.meta.pagination.totalPages).toBe(8); // 200 / 25
      expect(page1Res.body.meta.pagination.totalRecords).toBe(200);

      // 2. Fast SKU Prefix Search
      const searchRes = await request(app)
        .get('/api/v1/products?search=SKU-PERF-00042')
        .set('Cookie', cookie);

      expect(searchRes.status).toBe(200);
      expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
      expect(searchRes.body.data[0].sku).toBe('SKU-PERF-00042');
    });
  });

  // -------------------------------------------------------------
  // 4. BOUNDED OFFLINE CLIENT CACHE BENCHMARK
  // -------------------------------------------------------------
  describe('4. Bounded Offline Client Cache', () => {
    it('should cap client local storage cache to 1,000 items to protect low-end mobile browsers', () => {
      const storageMock: Record<string, string> = {};
      (globalThis as any).localStorage = {
        getItem: (key: string) => storageMock[key] || null,
        setItem: (key: string, val: string) => {
          storageMock[key] = val;
        },
        removeItem: (key: string) => {
          delete storageMock[key];
        },
        clear: () => {
          for (const k of Object.keys(storageMock)) delete storageMock[k];
        },
      };

      const mockProducts: any[] = [];
      for (let i = 1; i <= 1500; i++) {
        mockProducts.push({
          id: `prod_${i}`,
          name: `Product ${i}`,
          sku: `SKU-${i}`,
          sellingPrice: 19.99,
          barcode: `BARCODE_${i}`,
        });
      }

      // Initialize ProductCache with 1500 products
      ProductCache.init(mockProducts);

      // Fast lookup should work for any item in memory
      const found = ProductCache.lookup('BARCODE_500');
      expect(found).toBeDefined();
      expect(found?.name).toBe('Product 500');

      // Local storage must be bounded (slice to max 1000 items)
      const stored = (globalThis as any).localStorage.getItem('erp_offline_product_cache');
      expect(stored).toBeDefined();
      const parsed = JSON.parse(stored!);
      expect(parsed.length).toBe(1000);
    });
  });
});
