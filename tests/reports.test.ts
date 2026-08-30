import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('20. Business Reports Engine (Sales, Inventory, Purchases, Money, Real DB Aggregation, CSV Export)', () => {
  it('should generate accurate reports across all business domains from actual database data', async () => {
    // 1. Register Owner & Setup Tenant
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ceo.analytics@megastore.com',
        password: 'Password123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        businessName: 'MegaStore Retail Group',
      });
    const cookie = regRes.headers['set-cookie'];

    // 2. Setup Store Location & Stock
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'MegaStore Flagship', code: 'MS-FLAG-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // 3. Create Products with Categories
    const prod1Res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: '4K Ultra HD Smart Monitor',
        sku: 'MON-4K-UHD',
        categoryName: 'Electronics',
        sellingPrice: 400.0,
        costPrice: 250.0,
        isTaxable: true,
        taxRatePercent: 10,
        reorderPoint: 5,
        barcodes: [{ barcode: '7788990011223', symbology: 'EAN13' }],
      });
    const prod1Id = prod1Res.body.data._id;

    const prod2Res = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Wireless Mechanical Keyboard',
        sku: 'KEY-MECH-RGB',
        categoryName: 'Peripherals',
        sellingPrice: 120.0,
        costPrice: 60.0,
        isTaxable: true,
        taxRatePercent: 10,
        reorderPoint: 15,
        barcodes: [{ barcode: '7788990011224', symbology: 'EAN13' }],
      });
    const prod2Id = prod2Res.body.data._id;

    // Add Initial Stock: 20 Monitors, 10 Keyboards (Keyboards will be low stock: 10 <= 15)
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prod1Id, transactionType: 'PURCHASE', quantityDelta: 20 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prod2Id, transactionType: 'PURCHASE', quantityDelta: 10 });

    // 4. Create Customer & Supplier
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['CUSTOMER'],
        companyName: 'TechCorp Solutions',
        email: 'accounts@techcorp.com',
        phone: '+1-555-7788',
      });
    expect(custRes.status).toBe(201);
    const customerId = custRes.body.data._id;

    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['SUPPLIER'],
        companyName: 'Apex Hardware Supplies',
        email: 'sales@apexhardware.com',
      });
    expect(suppRes.status).toBe(201);
    const supplierId = suppRes.body.data._id;

    // 5. Create Purchase Order & Supplier Bill
    const poRes = await request(app)
      .post('/api/v1/purchases/orders')
      .set('Cookie', cookie)
      .send({
        supplierId,
        locationId,
        items: [{ productId: prod1Id, orderedQuantity: 10, unitCost: 250.0, taxRatePercent: 0 }],
      });
    expect(poRes.status).toBe(201);
    const poId = poRes.body.data._id;

    await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookie)
      .send({
        purchaseOrderId: poId,
        supplierInvoiceNumber: 'INV-APEX-9921',
        items: [{ productId: prod1Id, quantityReceived: 10, unitCost: 250.0 }],
      });

    // 6. Record Business Expense
    await request(app)
      .post('/api/v1/money/expenses')
      .set('Cookie', cookie)
      .send({
        category: 'RENT',
        amount: 500.0,
        description: 'Monthly Store Retail Space Rent',
        paymentMethod: 'BANK_TRANSFER',
      });

    // 7. Complete Real Sales (Sale 1: Cash, Sale 2: Card)
    // Sale 1: 2 Monitors ($400 * 2 = $800 + $80 tax = $880) Paid Cash
    const sale1Res = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerId,
        items: [{ productId: prod1Id, quantity: 2, unitPrice: 400.0, taxRatePercent: 10 }],
        payments: [{ paymentMethod: 'CASH', amount: 880.0, tenderedAmount: 900.0, changeAmount: 20.0 }],
      });
    expect(sale1Res.status).toBe(201);

    // Sale 2: 1 Keyboard ($120 + $12 tax = $132) Paid Card
    const sale2Res = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerId,
        items: [{ productId: prod2Id, quantity: 1, unitPrice: 120.0, taxRatePercent: 10 }],
        payments: [{ paymentMethod: 'CARD', amount: 132.0, reference: 'AUTH-VISA-991' }],
      });
    expect(sale2Res.status).toBe(201);

    // -------------------------------------------------------------
    // TEST 1: SALES SUMMARY & TODAY METRICS
    // -------------------------------------------------------------
    const salesSummaryRes = await request(app)
      .get('/api/v1/reports/sales/summary')
      .set('Cookie', cookie);

    expect(salesSummaryRes.status).toBe(200);
    const summary = salesSummaryRes.body.data;
    expect(summary.todayOrdersCount).toBe(2);
    expect(summary.todaySales).toBe(1012.0); // $880 + $132 = $1012
    expect(summary.totalRevenue).toBe(1012.0);
    expect(summary.totalOrders).toBe(2);
    expect(summary.averageOrderValue).toBe(506.0); // $1012 / 2 = $506

    // -------------------------------------------------------------
    // TEST 2: SALES BY PRODUCT & CATEGORY
    // -------------------------------------------------------------
    const salesByProdRes = await request(app)
      .get('/api/v1/reports/sales/by-product')
      .set('Cookie', cookie);

    expect(salesByProdRes.status).toBe(200);
    const prodReports = salesByProdRes.body.data;
    expect(prodReports.length).toBe(2);
    const monitorReport = prodReports.find((p: any) => p.name.includes('Smart Monitor'));
    expect(monitorReport).toBeDefined();
    expect(monitorReport.unitsSold).toBe(2);
    expect(monitorReport.totalRevenue).toBe(880.0);
    expect(monitorReport.estimatedCost).toBe(500.0); // 2 * $250 = $500
    expect(monitorReport.estimatedGrossProfit).toBe(380.0); // $880 - $500 = $380

    const salesByCatRes = await request(app)
      .get('/api/v1/reports/sales/by-category')
      .set('Cookie', cookie);

    expect(salesByCatRes.status).toBe(200);
    expect(salesByCatRes.body.data.length).toBeGreaterThanOrEqual(1);

    // -------------------------------------------------------------
    // TEST 3: PAYMENT METHOD BREAKDOWN
    // -------------------------------------------------------------
    const paymentsSummaryRes = await request(app)
      .get('/api/v1/reports/sales/by-payment-method')
      .set('Cookie', cookie);

    expect(paymentsSummaryRes.status).toBe(200);
    const payReports = paymentsSummaryRes.body.data;
    const cashReport = payReports.find((p: any) => p.paymentMethod === 'CASH');
    const cardReport = payReports.find((p: any) => p.paymentMethod === 'CARD');
    expect(cashReport.totalAmount).toBe(880.0);
    expect(cardReport.totalAmount).toBe(132.0);

    // -------------------------------------------------------------
    // TEST 4: INVENTORY CURRENT STOCK & VALUATION
    // -------------------------------------------------------------
    const stockValuationRes = await request(app)
      .get('/api/v1/reports/inventory/valuation')
      .set('Cookie', cookie);

    expect(stockValuationRes.status).toBe(200);
    const val = stockValuationRes.body.data;
    expect(val.totalItemsTracked).toBe(2);
    expect(val.totalUnitsOnHand).toBeGreaterThan(0);
    expect(val.totalCostValuation).toBeGreaterThan(0);
    expect(val.totalRetailValuation).toBeGreaterThan(val.totalCostValuation);
    expect(val.potentialMarginValue).toBeGreaterThan(0);

    // Low stock filter (Keyboards on hand = 9 <= reorderPoint 15)
    const lowStockRes = await request(app)
      .get('/api/v1/reports/inventory/low-stock')
      .set('Cookie', cookie);

    expect(lowStockRes.status).toBe(200);
    expect(lowStockRes.body.data.length).toBeGreaterThanOrEqual(1);
    expect(lowStockRes.body.data[0].sku).toBe('KEY-MECH-RGB');

    // -------------------------------------------------------------
    // TEST 5: PURCHASES BY SUPPLIER REPORT
    // -------------------------------------------------------------
    const purchasesReportRes = await request(app)
      .get('/api/v1/reports/purchases/by-supplier')
      .set('Cookie', cookie);

    expect(purchasesReportRes.status).toBe(200);
    const suppReport = purchasesReportRes.body.data[0];
    expect(suppReport.supplierName).toBe('Apex Hardware Supplies');
    expect(suppReport.poCount).toBe(1);
    expect(suppReport.totalSpend).toBe(2500.0); // 10 * $250 = $2500

    // -------------------------------------------------------------
    // TEST 6: REAL FINANCIAL SUMMARY (MONEY)
    // -------------------------------------------------------------
    const financeReportRes = await request(app)
      .get('/api/v1/reports/money/summary')
      .set('Cookie', cookie);

    expect(financeReportRes.status).toBe(200);
    const fin = financeReportRes.body.data;
    expect(fin.revenue).toBe(1012.0);
    expect(fin.costOfGoodsSold).toBe(560.0); // (2 * 250) + (1 * 60) = $560
    expect(fin.grossProfit).toBe(452.0); // 1012 - 560 = 452
    expect(fin.operatingExpenses).toBe(500.0); // Rent = $500
    expect(fin.netProfit).toBe(-48.0); // 452 - 500 = -48

    // -------------------------------------------------------------
    // TEST 7: AUTHORIZED CSV EXPORT CAPABILITY
    // -------------------------------------------------------------
    const csvExportRes = await request(app)
      .get('/api/v1/reports/sales/by-product?format=csv')
      .set('Cookie', cookie);

    expect(csvExportRes.status).toBe(200);
    expect(csvExportRes.headers['content-type']).toContain('text/csv');
    expect(csvExportRes.text).toContain('productId,name,sku,unitsSold,totalRevenue,estimatedCost,estimatedGrossProfit');
    expect(csvExportRes.text).toContain('4K Ultra HD Smart Monitor');
    expect(csvExportRes.text).toContain('Wireless Mechanical Keyboard');
  });

  it('should enforce strict tenant isolation across all report aggregations', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantA.reports@co.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A Analytics',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B (fresh empty tenant)
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantB.reports@co.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B Analytics',
      });
    const cookieB = regB.headers['set-cookie'];

    // Tenant A makes a sale
    const locA = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookieA)
      .send({ name: 'Loc A', code: 'LOC-A' });
    const locAId = locA.body.data._id;

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Secret Product A', sku: 'PROD-A', sellingPrice: 500.0 });
    const prodAId = prodA.body.data._id;

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookieA)
      .send({ locationId: locAId, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 5 });

    await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookieA)
      .send({
        locationId: locAId,
        items: [{ productId: prodAId, quantity: 1, unitPrice: 500.0 }],
        payments: [{ paymentMethod: 'CASH', amount: 500.0 }],
      });

    // Tenant B queries sales summary -> must be 0 revenue and 0 orders
    const summaryB = await request(app)
      .get('/api/v1/reports/sales/summary')
      .set('Cookie', cookieB);

    expect(summaryB.status).toBe(200);
    expect(summaryB.body.data.totalRevenue).toBe(0);
    expect(summaryB.body.data.totalOrders).toBe(0);

    // Tenant B queries stock valuation -> must be 0
    const valuationB = await request(app)
      .get('/api/v1/reports/inventory/valuation')
      .set('Cookie', cookieB);

    expect(valuationB.status).toBe(200);
    expect(valuationB.body.data.totalItemsTracked).toBe(0);
    expect(valuationB.body.data.totalUnitsOnHand).toBe(0);
  });
});
