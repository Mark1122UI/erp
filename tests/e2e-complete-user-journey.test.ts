import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { InventoryItem } from '../src/core/inventory/inventory.model.js';
import { Sale } from '../src/core/sales/sale.model.js';
import { Party } from '../src/core/parties/party.model.js';
import { Category, Product } from '../src/core/catalog/product.model.js';
import { SupplierBill } from '../src/core/purchasing/purchase.model.js';
import mongoose from 'mongoose';

describe('COMPLETE END-TO-END QA AUDIT: 32-Step Master User Journey & Verification', () => {
  it('should execute the complete 32-step user journey from registration through POS, inventory, purchasing, reports, and offline sync', async () => {
    // =============================================================
    // STEP 1 & 2: REGISTER AND CREATE BUSINESS TENANT
    // =============================================================
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'qa.owner@apexsuperstore.com',
        password: 'Password123!',
        firstName: 'Arthur',
        lastName: 'Pendleton',
        businessName: 'Apex Superstore QA',
        country: 'US',
        currency: 'USD',
      });

    expect(regRes.status).toBe(201);
    expect(regRes.body.success).toBe(true);
    expect(regRes.body.data.user.email).toBe('qa.owner@apexsuperstore.com');
    expect(regRes.body.data.tenant.name).toBe('Apex Superstore QA');
    expect(regRes.body.data.role).toBe('Owner');

    let ownerCookie = regRes.headers['set-cookie'];
    const tenantId = regRes.body.data.tenant.id;
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const ownerUserId = regRes.body.data.user.id;

    // =============================================================
    // STEP 3: LOGIN
    // =============================================================
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'qa.owner@apexsuperstore.com',
        password: 'Password123!',
      });

    expect(loginRes.status).toBe(200);
    expect(loginRes.body.success).toBe(true);
    ownerCookie = loginRes.headers['set-cookie'];

    // =============================================================
    // STEP 4 & 5: ADD USER AND ASSIGN ROLE (CASHIER)
    // =============================================================
    const inviteRes = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', ownerCookie)
      .send({
        email: 'cashier.cathy@apexsuperstore.com',
        firstName: 'Cathy',
        lastName: 'Cashier',
        role: 'Staff',
      });

    expect(inviteRes.status).toBe(201);
    const inviteToken = inviteRes.body.data.invitationToken;

    // Accept invitation
    const acceptRes = await request(app)
      .post('/api/v1/users/accept-invitation')
      .send({
        token: inviteToken,
        password: 'Password123!',
      });
    expect(acceptRes.status).toBe(200);

    // Promote to Cashier
    const userListRes = await request(app)
      .get('/api/v1/users')
      .set('Cookie', ownerCookie);

    const cashierUser = userListRes.body.data.find(
      (u: any) => u.email === 'cashier.cathy@apexsuperstore.com'
    );
    expect(cashierUser).toBeDefined();
    const cashierUserId = cashierUser.id;

    const roleRes = await request(app)
      .patch(`/api/v1/users/${cashierUserId}/role`)
      .set('Cookie', ownerCookie)
      .send({ role: 'Cashier' });

    expect(roleRes.status).toBe(200);
    expect(roleRes.body.data.role).toBe('Cashier');

    // Login as Cashier
    const cashierLoginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'cashier.cathy@apexsuperstore.com',
        password: 'Password123!',
      });
    expect(cashierLoginRes.status).toBe(200);
    const cashierCookie = cashierLoginRes.headers['set-cookie'];

    // =============================================================
    // STEP 6: ADD CATEGORY
    // =============================================================
    const cat = await Category.create({
      tenantId: tenantObjectId,
      name: 'Organic Gourmet Coffee',
      slug: 'organic-gourmet-coffee',
      description: 'Specialty roasted whole bean coffees',
      isActive: true,
    });
    expect(cat).toBeDefined();
    const categoryId = cat.id;

    // =============================================================
    // STEP 7 & 8: ADD PRODUCT AND REGISTER MULTI-BARCODE
    // =============================================================
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Dark Roast Arabica Coffee Beans 1kg',
        sku: 'SKU-COFFEE-001',
        categoryName: 'Organic Gourmet Coffee',
        categoryId,
        sellingPrice: 24.99,
        costPrice: 12.50,
        isTaxable: true,
        taxRatePercent: 8.0,
        unit: 'BAG',
        reorderPoint: 10,
        trackInventory: true,
        barcodes: [
          {
            barcode: '8901234567890',
            symbology: 'EAN13',
            isPrimary: true,
            description: 'Main retail bag barcode',
          },
        ],
      });

    expect(prodRes.status).toBe(201);
    expect(prodRes.body.data.sku).toBe('SKU-COFFEE-001');
    const productId = prodRes.body.data.id || prodRes.body.data._id;

    // Add secondary barcode
    const barcodeRes = await request(app)
      .post(`/api/v1/products/${productId}/barcodes`)
      .set('Cookie', ownerCookie)
      .send({
        barcode: '8901234567899',
        symbology: 'CODE128',
        isPrimary: false,
        description: 'Wholesale carton barcode',
      });
    expect(barcodeRes.status).toBe(201);

    // =============================================================
    // STEP 9: ADD CUSTOMER
    // =============================================================
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', ownerCookie)
      .send({
        displayName: 'Summit Tech Cafe',
        firstName: 'Elena',
        lastName: 'Rostova',
        roles: ['CUSTOMER'],
        email: 'elena@summitcafe.com',
        phone: '+1-555-8392',
        customerDetails: {
          creditLimit: 500.0,
          paymentTermsDays: 15,
        },
      });

    expect(custRes.status).toBe(201);
    const customerId = custRes.body.data._id;

    // =============================================================
    // STEP 10: ADD SUPPLIER
    // =============================================================
    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', ownerCookie)
      .send({
        displayName: 'Direct Trade Coffee Roasters LLC',
        firstName: 'Marcus',
        lastName: 'Vance',
        roles: ['SUPPLIER'],
        email: 'orders@directtrade.com',
        phone: '+1-555-9988',
        supplierDetails: {
          defaultPaymentTermsDays: 30,
        },
      });

    expect(suppRes.status).toBe(201);
    const supplierId = suppRes.body.data._id;

    // =============================================================
    // STEP 11: CREATE LOCATIONS (STORE & WAREHOUSE)
    // =============================================================
    const storeRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Apex Main Storefront',
        code: 'STORE-MAIN',
        type: 'STORE',
        isDefault: true,
      });

    expect(storeRes.status).toBe(201);
    const primaryLocationId = storeRes.body.data.id || storeRes.body.data._id;

    const warehouseRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', ownerCookie)
      .send({
        name: 'Central Roastery Warehouse',
        code: 'WH-CENTRAL',
        type: 'WAREHOUSE',
      });

    expect(warehouseRes.status).toBe(201);
    const secondaryLocationId = warehouseRes.body.data.id || warehouseRes.body.data._id;

    // =============================================================
    // STEP 12: ADD OPENING STOCK
    // =============================================================
    const movementRes = await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', ownerCookie)
      .send({
        locationId: primaryLocationId,
        productId,
        transactionType: 'OPENING_BALANCE',
        quantityDelta: 100, // 100 bags opening balance
        costPerUnit: 12.50,
        notes: 'Initial physical inventory count on go-live',
      });

    expect(movementRes.status).toBe(201);

    // =============================================================
    // STEP 13, 14 & 15: OPEN POS, SEARCH PRODUCT & SCAN BARCODE
    // =============================================================
    // 13 & 14. Text Search
    const searchRes = await request(app)
      .get(`/api/v1/pos/search?query=Arabica&locationId=${primaryLocationId}`)
      .set('Cookie', cashierCookie);

    expect(searchRes.status).toBe(200);
    expect(searchRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(searchRes.body.data[0].sku).toBe('SKU-COFFEE-001');
    expect(searchRes.body.data[0].quantityOnHand).toBe(100);

    // 15. Barcode Scan (Exact match)
    const scanRes = await request(app)
      .get(`/api/v1/pos/search?query=8901234567890&locationId=${primaryLocationId}`)
      .set('Cookie', cashierCookie);

    expect(scanRes.status).toBe(200);
    expect(scanRes.body.data.length).toBe(1);
    expect(scanRes.body.data[0].id).toBe(productId);

    // =============================================================
    // STEP 16 & 17: COMPLETE CASH SALE & PRINT RECEIPT
    // =============================================================
    const checkoutRes = await request(app)
      .post('/api/v1/pos/checkout')
      .set('Cookie', cashierCookie)
      .send({
        locationId: primaryLocationId,
        customerId,
        customerName: 'Summit Tech Cafe',
        items: [
          {
            productId,
            quantity: 2,
            unitPrice: 24.99,
            discountAmount: 0,
            taxRatePercent: 8.0,
          },
        ],
        payments: [
          {
            amount: 53.98,
            paymentMethod: 'CASH',
            tenderedAmount: 60.0,
            changeAmount: 6.02,
          },
        ],
        notes: 'POS Register 01 Sale',
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.data.sale.status).toBe('PAID');
    expect(checkoutRes.body.data.sale.grandTotal).toBe(53.98);

    const saleId = checkoutRes.body.data.sale.id || checkoutRes.body.data.sale._id;

    // 17. Generate & Print Receipt Document
    const receiptRes = await request(app)
      .get(`/api/v1/documents/receipt/${saleId}`)
      .set('Cookie', cashierCookie);

    expect(receiptRes.status).toBe(200);
    expect(receiptRes.body.data.documentType).toBe('RECEIPT');
    expect(receiptRes.body.data.totals.grandTotal).toBe(53.98);

    // =============================================================
    // STEP 18: CHECK INVENTORY (REDUCED 100 -> 98)
    // =============================================================
    const stockAfterSale = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    expect(stockAfterSale).toBeDefined();
    expect(stockAfterSale!.quantityOnHand).toBe(98);

    // =============================================================
    // STEP 19: RECEIVE STOCK (GOODS RECEIPT)
    // =============================================================
    const receiveRes = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', ownerCookie)
      .send({
        locationId: primaryLocationId,
        supplierId,
        items: [
          {
            productId,
            quantityReceived: 50,
            unitCost: 12.50,
          },
        ],
        notes: 'Fresh shipment received from roastery',
      });

    expect(receiveRes.status).toBe(201);

    const stockAfterReceive = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    // 98 + 50 = 148
    expect(stockAfterReceive!.quantityOnHand).toBe(148);

    // =============================================================
    // STEP 20: TRANSFER STOCK (STORE -> WAREHOUSE)
    // =============================================================
    const transferRes = await request(app)
      .post('/api/v1/inventory/transfers')
      .set('Cookie', ownerCookie)
      .send({
        sourceLocationId: primaryLocationId,
        destinationLocationId: secondaryLocationId,
        items: [
          {
            productId,
            quantity: 30,
          },
        ],
        notes: 'Relocate backup inventory to Central Warehouse',
      });

    expect(transferRes.status).toBe(201);
    const transferId = transferRes.body.data.id || transferRes.body.data._id;

    // Dispatch transfer
    await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/dispatch`)
      .set('Cookie', ownerCookie);

    // Receive transfer at warehouse
    await request(app)
      .patch(`/api/v1/inventory/transfers/${transferId}/receive`)
      .set('Cookie', ownerCookie);

    // Store: 148 - 30 = 118, Warehouse: 30
    const storeStock = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    const whStock = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(secondaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    expect(storeStock!.quantityOnHand).toBe(118);
    expect(whStock!.quantityOnHand).toBe(30);

    // =============================================================
    // STEP 21 & 22: COUNT STOCK & RECORD ADJUSTMENT
    // =============================================================
    const adjustRes = await request(app)
      .post('/api/v1/inventory/adjustments')
      .set('Cookie', ownerCookie)
      .send({
        locationId: primaryLocationId,
        reason: 'DAMAGED_EXPIRED',
        items: [
          {
            productId,
            deltaQuantity: -3, // 3 bags damaged
          },
        ],
        notes: '3 bags damaged during shelf restocking',
      });

    expect(adjustRes.status).toBe(201);

    const stockAfterCount = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    // 118 - 3 = 115
    expect(stockAfterCount!.quantityOnHand).toBe(115);

    // =============================================================
    // STEP 23: CREATE PURCHASE ORDER & PAY SUPPLIER BILL
    // =============================================================
    const poRes = await request(app)
      .post('/api/v1/purchases/orders')
      .set('Cookie', ownerCookie)
      .send({
        supplierId,
        locationId: primaryLocationId,
        items: [
          {
            productId,
            orderedQuantity: 40,
            unitCost: 12.50,
          },
        ],
        notes: 'Monthly bulk roasted beans purchase order',
      });

    expect(poRes.status).toBe(201);
    expect(poRes.body.data.grandTotal).toBe(500.0);

    // List and Pay Supplier Bill in full
    const billListRes = await request(app)
      .get('/api/v1/purchases/bills')
      .set('Cookie', ownerCookie);

    expect(billListRes.status).toBe(200);
    expect(billListRes.body.data.length).toBeGreaterThanOrEqual(1);

    const bill = billListRes.body.data[0];
    const billId = bill.id || bill._id;

    // Pay bill via /api/v1/purchases/bills/:id/pay
    const payRes = await request(app)
      .post(`/api/v1/purchases/bills/${billId}/pay`)
      .set('Cookie', ownerCookie)
      .send({
        amount: bill.dueAmount,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'WIRE-992019',
      });

    expect(payRes.status).toBe(200);
    expect(payRes.body.data.status).toBe('PAID');
    expect(payRes.body.data.dueAmount).toBe(0);

    // =============================================================
    // STEP 24: RECORD OPERATING EXPENSE
    // =============================================================
    const expRes = await request(app)
      .post('/api/v1/money/expenses')
      .set('Cookie', ownerCookie)
      .send({
        category: 'Utilities',
        amount: 145.0,
        paymentMethod: 'CARD',
        reference: 'POWER-BILL-AUG2026',
        notes: 'Store electricity & roaster cooling power',
      });

    expect(expRes.status).toBe(201);
    expect(expRes.body.data.amount).toBe(145.0);

    // =============================================================
    // STEP 25: PROCESS SALES RETURN (RESTOCK)
    // =============================================================
    const returnRes = await request(app)
      .post('/api/v1/sales/returns')
      .set('Cookie', ownerCookie)
      .send({
        originalSaleId: saleId,
        locationId: primaryLocationId,
        items: [
          {
            productId,
            name: 'Dark Roast Arabica Coffee Beans 1kg',
            sku: 'SKU-COFFEE-001',
            quantity: 1,
            unitPrice: 24.99,
            refundAmount: 26.99, // $24.99 + 8% tax
          },
        ],
        totalRefundAmount: 26.99,
        refundPaymentMethod: 'CASH',
        reason: 'Customer bought wrong roast level by mistake',
      });

    expect(returnRes.status).toBe(201);

    // Restock verified: 115 + 1 = 116
    const stockAfterReturn = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    expect(stockAfterReturn!.quantityOnHand).toBe(116);

    // =============================================================
    // STEP 26 & 27: CHECK CUSTOMER AND SUPPLIER BALANCES
    // =============================================================
    const cust = await Party.findOne({ _id: new mongoose.Types.ObjectId(customerId), tenantId: tenantObjectId });
    expect(cust).toBeDefined();
    expect(cust!.roles).toContain('CUSTOMER');

    const supp = await Party.findOne({ _id: new mongoose.Types.ObjectId(supplierId), tenantId: tenantObjectId });
    expect(supp).toBeDefined();
    expect(supp!.roles).toContain('SUPPLIER');
    expect(supp!.supplierDetails?.currentBalance).toBe(0);

    // =============================================================
    // STEP 28 & 29: VIEW REPORTS & EXPORT DATA
    // =============================================================
    // 28. Financial Summary Report
    const reportRes = await request(app)
      .get('/api/v1/reports/sales/summary')
      .set('Cookie', ownerCookie);

    expect(reportRes.status).toBe(200);
    expect(reportRes.body.success).toBe(true);

    // 29. Export Inventory CSV
    const exportRes = await request(app)
      .get('/api/v1/reports/inventory/current?format=csv')
      .set('Cookie', ownerCookie);

    expect(exportRes.status).toBe(200);
    expect(exportRes.headers['content-type']).toContain('text/csv');

    // =============================================================
    // STEP 30, 31 & 32: OFFLINE SALE, RECONNECT & IDEMPOTENT SYNC
    // =============================================================
    const offlineClientRefId = `offline_qa_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    const offlinePayload = {
      offlineSaleId: offlineClientRefId,
      locationId: primaryLocationId,
      customerName: 'Walk-in Subway Commuter',
      items: [
        {
          productId,
          quantity: 1,
          unitPrice: 24.99,
          taxRatePercent: 8.0,
        },
      ],
      payments: [
        {
          amount: 26.99,
          paymentMethod: 'CASH' as const,
          tenderedAmount: 30.0,
          changeAmount: 3.01,
        },
      ],
      notes: 'Recorded during internet outage on POS tablet',
    };

    // 31. Submit Offline Batch
    const syncRes1 = await request(app)
      .post('/api/v1/pos/offline-sync')
      .set('Cookie', cashierCookie)
      .send({
        offlineSales: [offlinePayload],
      });

    expect(syncRes1.status).toBe(200);
    expect(syncRes1.body.data.synced.length).toBe(1);

    // 32. Idempotent Synchronization (Submitting second time does not duplicate)
    const syncRes2 = await request(app)
      .post('/api/v1/pos/offline-sync')
      .set('Cookie', cashierCookie)
      .send({
        offlineSales: [offlinePayload],
      });

    expect(syncRes2.status).toBe(200);
    expect(syncRes2.body.data.duplicatesSkipped.length).toBe(1);

    const countOffline = await Sale.countDocuments({
      tenantId: tenantObjectId,
      clientReferenceId: offlineClientRefId,
    });
    expect(countOffline).toBe(1);

    // Final Stock Verification: 116 - 1 = 115
    const finalStock = await InventoryItem.findOne({
      tenantId: tenantObjectId,
      locationId: new mongoose.Types.ObjectId(primaryLocationId),
      productId: new mongoose.Types.ObjectId(productId),
    });
    expect(finalStock!.quantityOnHand).toBe(115);
  });

  // =============================================================
  // SECTION 6: SECURITY & PERMISSION AUDIT
  // =============================================================

  it('should enforce security boundaries and block unauthorized operations', async () => {
    // 1. Setup Tenant A
    const tenantARes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerA@securecorp.com',
        password: 'Password123!',
        firstName: 'Owner',
        lastName: 'A',
        businessName: 'Secure Corp A',
      });
    const tenantACookie = tenantARes.headers['set-cookie'];
    const tenantAId = tenantARes.body.data.tenant.id;

    // Create a product in Tenant A
    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', tenantACookie)
      .send({
        name: 'Confidential Recipe',
        sku: 'SKU-SECRET-A',
        sellingPrice: 99.0,
      });
    expect(prodA.status).toBe(201);
    const productAId = prodA.body.data.id || prodA.body.data._id;

    // Invite Cashier in Tenant A
    const inviteRes = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', tenantACookie)
      .send({
        email: 'cashierA@securecorp.com',
        firstName: 'Cashier',
        lastName: 'A',
        role: 'Cashier',
      });
    const cashierToken = inviteRes.body.data.invitationToken;

    await request(app)
      .post('/api/v1/users/accept-invitation')
      .send({ token: cashierToken, password: 'Password123!' });

    const cashierLogin = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'cashierA@securecorp.com', password: 'Password123!' });
    const cashierACookie = cashierLogin.headers['set-cookie'];

    // 2. Setup Tenant B
    const tenantBRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerB@hackergroup.com',
        password: 'Password123!',
        firstName: 'Attacker',
        lastName: 'B',
        businessName: 'Hacker Group B',
      });
    const tenantBCookie = tenantBRes.headers['set-cookie'];

    // Attack 1: Tenant B accessing Tenant A Product by ID -> 404
    const idorRes = await request(app)
      .get(`/api/v1/products/${productAId}`)
      .set('Cookie', tenantBCookie);
    expect(idorRes.status).toBe(404);

    // Attack 2: Cashier attempting to access Settings -> 403 Forbidden
    const settingsRes = await request(app)
      .get('/api/v1/business/settings')
      .set('Cookie', cashierACookie);
    expect(settingsRes.status).toBe(403);

    // Attack 3: Cashier attempting unauthorized stock adjustment -> 403 Forbidden
    const adjustRes = await request(app)
      .post('/api/v1/inventory/adjustments')
      .set('Cookie', cashierACookie)
      .send({
        locationId: new mongoose.Types.ObjectId().toString(),
        reason: 'PHYSICAL_COUNT',
        items: [{ productId: productAId, deltaQuantity: 1000 }],
      });
    expect(adjustRes.status).toBe(403);

    // Attack 4: Cashier attempting unauthorized user management -> 403 Forbidden
    const inviteHack = await request(app)
      .post('/api/v1/users/invite')
      .set('Cookie', cashierACookie)
      .send({
        email: 'backdoor@securecorp.com',
        firstName: 'Backdoor',
        lastName: 'User',
        role: 'Owner',
      });
    expect(inviteHack.status).toBe(403);
  });
});
