import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Expense } from '../src/core/money/money.model.js';
import { InventoryItem } from '../src/core/inventory/inventory.model.js';
import mongoose from 'mongoose';

describe('12. Money Module, Expenses, Role-Aware Dashboard & Accurate Financial Metrics', () => {
  it('should calculate 100% accurate financial summary and dashboard metrics from actual transactions', async () => {
    // 1. Register Merchant
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'money_boss@fintech.com',
        password: 'Password123!',
        firstName: 'Miles',
        lastName: 'Money',
        businessName: 'Apex Commercial Hub',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Customer & Supplier
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        firstName: 'Carol',
        lastName: 'Customer',
        type: 'INDIVIDUAL',
        roles: ['CUSTOMER'],
      });
    const customerId = custRes.body.data._id;

    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', cookie)
      .send({
        companyName: 'Prime Wholesalers',
        type: 'ORGANIZATION',
        roles: ['SUPPLIER'],
      });
    const supplierId = suppRes.body.data._id;

    // 3. Create Product: Cost $10, Selling $25
    const prodRes = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Industrial Widget Alpha',
        sku: 'WIDGET-ALPHA-01',
        costPrice: 10.0,
        sellingPrice: 25.0,
        reorderPoint: 150, // We will trigger low stock alert
      });
    const productId = prodRes.body.data._id;

    // 4. Create Location & Add 100 Initial Stock
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Central Depot', code: 'DEPOT-01', isDefault: true });
    const locationId = locRes.body.data._id;

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({
        locationId,
        productId,
        transactionType: 'OPENING_BALANCE',
        quantityDelta: 100,
        costPerUnit: 10.0,
      });

    // 5. Transaction A: Sale of 20 widgets @ $25 = $500 total ($200 COGS)
    // Customer pays $400, leaving $100 due (Accounts Receivable)
    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        customerId,
        locationId,
        items: [{ productId, quantity: 20, unitPrice: 25.0 }],
        payments: [{ amount: 400.0, paymentMethod: 'CARD' }],
      });
    expect(saleRes.status).toBe(201);
    expect(saleRes.body.data.grandTotal).toBe(500.0);
    expect(saleRes.body.data.paidAmount).toBe(400.0);
    expect(saleRes.body.data.dueAmount).toBe(100.0);

    // 6. Transaction B: Purchase & Receive 50 units @ $10 = $500 Bill
    // We pay supplier $200, leaving $300 due (Accounts Payable)
    const receiveRes = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookie)
      .send({
        supplierId,
        locationId,
        items: [{ productId, quantityReceived: 50, unitCost: 10.0 }],
      });
    expect(receiveRes.status).toBe(201);
    const billId = receiveRes.body.data.bill._id;

    const payBillRes = await request(app)
      .post(`/api/v1/purchases/bills/${billId}/pay`)
      .set('Cookie', cookie)
      .send({
        amount: 200.0,
        paymentMethod: 'BANK_TRANSFER',
      });
    expect(payBillRes.status).toBe(200);
    expect(payBillRes.body.data.dueAmount).toBe(300.0);

    // 7. Transaction C: Record Operating Expense of $80 for Utilities
    const expRes = await request(app)
      .post('/api/v1/money/expenses')
      .set('Cookie', cookie)
      .send({
        category: 'Utilities & Power',
        amount: 80.0,
        paymentMethod: 'CASH',
        notes: 'Monthly electric power bill',
      });
    expect(expRes.status).toBe(201);
    expect(expRes.body.data.expenseNumber).toMatch(/^EXP-/);

    // 8. Verify Money Summary API
    const summaryRes = await request(app)
      .get('/api/v1/money/summary')
      .set('Cookie', cookie);

    expect(summaryRes.status).toBe(200);
    const sum = summaryRes.body.data;

    // Expected Financial Arithmetic:
    // Sales Revenue: $500.00
    // COGS: 20 * $10 = $200.00
    // Gross Profit: $500 - $200 = $300.00
    // Operating Expenses: $80.00
    // Estimated Net Profit: $300 - $80 = $220.00
    // Cash Inflow (Customer Payments): $400.00
    // Cash Outflow (Supplier Payments $200 + Expenses $80): $280.00
    // Net Cash Position: $400 - $280 = $120.00
    // Accounts Receivable (Customer Balances Due): $100.00
    // Accounts Payable (Supplier Balances Due): $300.00

    expect(sum.sales.totalRevenue).toBe(500.0);
    expect(sum.sales.costOfGoodsSold).toBe(200.0);
    expect(sum.sales.grossProfit).toBe(300.0);
    expect(sum.expenses.totalExpenses).toBe(80.0);
    expect(sum.profitability.estimatedProfit).toBe(220.0);
    expect(sum.cashFlow.paymentsReceived).toBe(400.0);
    expect(sum.cashFlow.paymentsMade).toBe(280.0);
    expect(sum.cashFlow.netCashPosition).toBe(120.0);
    expect(sum.receivablesAndPayables.customerBalancesDue).toBe(100.0);
    expect(sum.receivablesAndPayables.supplierBalancesDue).toBe(300.0);

    // 9. Verify Dashboard API
    const dashRes = await request(app)
      .get('/api/v1/money/dashboard')
      .set('Cookie', cookie);

    expect(dashRes.status).toBe(200);
    const dash = dashRes.body.data;

    expect(dash.metrics.salesToday).toBe(500.0);
    expect(dash.metrics.salesThisMonth).toBe(500.0);
    expect(dash.metrics.expensesThisMonth).toBe(80.0);
    expect(dash.metrics.estimatedProfit).toBe(220.0);
    expect(dash.metrics.outstandingCustomerPayments).toBe(100.0);
    expect(dash.metrics.outstandingSupplierPayments).toBe(300.0);
    expect(dash.metrics.cashPosition).toBe(120.0);

    // Verify Low stock: 100 - 20 (sale) + 50 (purchase) = 130 <= 150 reorder point
    expect(dash.metrics.lowStockCount).toBeGreaterThanOrEqual(1);
    expect(dash.lowStockItems[0].name).toBe('Industrial Widget Alpha');

    // Verify Recent Transactions list
    expect(dash.recentTransactions.length).toBeGreaterThanOrEqual(2);
    expect(dash.recentTransactions.some((t: any) => t.type === 'SALE' && t.amount === 500.0)).toBe(true);
    expect(dash.recentTransactions.some((t: any) => t.type === 'EXPENSE' && t.amount === 80.0)).toBe(true);
  });

  it('should enforce tenant isolation for expenses', async () => {
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'finA@corp.com',
        password: 'Password123!',
        firstName: 'Anna',
        lastName: 'A',
        businessName: 'Business A Financials',
      });
    const cookieA = regA.headers['set-cookie'];

    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'finB@corp.com',
        password: 'Password123!',
        firstName: 'Ben',
        lastName: 'B',
        businessName: 'Business B Financials',
      });
    const cookieB = regB.headers['set-cookie'];

    await request(app)
      .post('/api/v1/money/expenses')
      .set('Cookie', cookieA)
      .send({ category: 'Rent & Lease', amount: 1500, paymentMethod: 'BANK_TRANSFER' });

    // Tenant B queries expenses -> should be empty
    const listB = await request(app)
      .get('/api/v1/money/expenses')
      .set('Cookie', cookieB);

    expect(listB.status).toBe(200);
    expect(listB.body.data.length).toBe(0);
  });
});
