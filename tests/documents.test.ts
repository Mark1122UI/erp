import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Tenant } from '../src/core/tenancy/tenant.model.js';
import mongoose from 'mongoose';

describe('16. Business Documents Engine (Invoice, Receipt, Quote, PO, Bill, Delivery Note, Credit Note, Statement)', () => {
  it('should generate all 8 business document types with tenant branding and mathematical accuracy', async () => {
    // 1. Register Merchant with full branding & tax profile
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ceo@acmecorp.com',
        password: 'Password123!',
        firstName: 'Arthur',
        lastName: 'Acme',
        businessName: 'Acme Global Enterprises',
      });
    const cookie = reg.headers['set-cookie'];

    const tenantId = reg.body.data.tenant?.id || reg.body.data.tenant?._id || reg.body.data.currentBusiness?.id;

    // Update Tenant with custom branding & address & tax info
    await Tenant.findByIdAndUpdate(
      tenantId,
      {
        phone: '+1 555-0199',
        email: 'billing@acmeglobal.com',
        logoUrl: 'https://cdn.acmeglobal.com/logo.png',
        address: {
          street: '100 Enterprise Way',
          city: 'Metropolis',
          state: 'NY',
          postalCode: '10001',
          country: 'USA',
        },
        settings: {
          taxNumber: 'US-TAX-889922-Z',
          receiptHeader: 'Welcome to Acme Global',
          receiptFooter: 'Thank you for your business. Visit acmeglobal.com',
        },
      }
    );

    // 2. Setup Location & Products
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Flagship Store', code: 'FLAG-01', isDefault: true });
    const locationId = locRes.body.data._id;

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Enterprise Cloud Server Rack',
        sku: 'SRV-RACK-42U',
        sellingPrice: 1200.0,
        costPrice: 750.0,
        isTaxable: true,
        taxRatePercent: 10,
        barcodes: [{ barcode: '1122334455667', symbology: 'EAN13' }],
      });
    const prodAId = prodA.body.data._id;

    const prodB = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Cat6 Ethernet Patch Cable 5m',
        sku: 'CAB-CAT6-5M',
        sellingPrice: 15.0,
        costPrice: 4.0,
        isTaxable: false,
        taxRatePercent: 0,
      });
    const prodBId = prodB.body.data._id;

    // Add stock
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 20 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodBId, transactionType: 'PURCHASE', quantityDelta: 50 });

    // 3. Create Customer & Supplier
    const custRes = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['CUSTOMER'],
        companyName: 'Wayne Tech Industries',
        email: 'procurement@waynetech.com',
        phone: '+1 555-9988',
        billingAddress: { street: '1007 Mountain Drive', city: 'Gotham', state: 'NJ', postalCode: '07001' },
        taxNumber: 'GOTH-VAT-1001',
      });
    expect(custRes.status).toBe(201);
    const customerId = custRes.body.data._id;

    const suppRes = await request(app)
      .post('/api/v1/suppliers')
      .set('Cookie', cookie)
      .send({
        type: 'ORGANIZATION',
        roles: ['SUPPLIER'],
        companyName: 'Global Microchips Inc',
        email: 'orders@globalmicro.com',
        phone: '+1 555-7766',
        taxNumber: 'SUPP-TAX-5544',
      });
    expect(suppRes.status).toBe(201);
    const supplierId = suppRes.body.data._id;

    // -------------------------------------------------------------
    // TEST 1: TAX INVOICE & RECEIPT
    // -------------------------------------------------------------
    // Create Sale / Invoice: 2 Server Racks ($2400 + $240 tax) + 4 Cables ($60) = Subtotal $2460, Tax $240, Total $2700
    // Paid $1700, Balance Due $1000
    const saleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        docType: 'INVOICE',
        locationId,
        customerId,
        items: [
          { productId: prodAId, quantity: 2, unitPrice: 1200.0, taxRatePercent: 10 },
          { productId: prodBId, quantity: 4, unitPrice: 15.0, taxRatePercent: 0 },
        ],
        payments: [{ amount: 1700.0, paymentMethod: 'BANK_TRANSFER', reference: 'WT-WIRE-8899' }],
        notes: 'Deliver to Data Center Annex B',
      });
    expect(saleRes.status).toBe(201);
    const saleId = saleRes.body.data._id;

    // Fetch Invoice JSON Document
    const invDocRes = await request(app)
      .get(`/api/v1/documents/invoice/${saleId}`)
      .set('Cookie', cookie);

    expect(invDocRes.status).toBe(200);
    const invoice = invDocRes.body.data;
    expect(invoice.documentType).toBe('INVOICE');
    expect(invoice.title).toBe('TAX INVOICE');
    expect(invoice.issuer.name).toBe('Acme Global Enterprises');
    expect(invoice.issuer.taxNumber).toBe('US-TAX-889922-Z');
    expect(invoice.recipient.name).toBe('Wayne Tech Industries');
    expect(invoice.recipient.taxNumber).toBe('GOTH-VAT-1001');

    // Test Mathematical Accuracy against Source Transaction
    expect(invoice.items.length).toBe(2);
    expect(invoice.items[0].lineTotal).toBe(2640.0); // (2 * 1200) + 10% tax = 2640
    expect(invoice.items[1].lineTotal).toBe(60.0);   // (4 * 15) = 60
    expect(invoice.totals.subtotal).toBe(2460.0);
    expect(invoice.totals.taxTotal).toBe(240.0);
    expect(invoice.totals.grandTotal).toBe(2700.0);
    expect(invoice.totals.amountPaid).toBe(1700.0);
    expect(invoice.totals.balanceDue).toBe(1000.0);
    expect(invoice.payments.length).toBe(1);
    expect(invoice.payments[0].reference).toBe('WT-WIRE-8899');

    // Fetch Receipt Document
    const receiptDocRes = await request(app)
      .get(`/api/v1/documents/receipt/${saleId}`)
      .set('Cookie', cookie);
    expect(receiptDocRes.status).toBe(200);
    expect(receiptDocRes.body.data.documentType).toBe('RECEIPT');
    expect(receiptDocRes.body.data.title).toBe('PAYMENT RECEIPT');

    // -------------------------------------------------------------
    // TEST 2: PRICE QUOTATION
    // -------------------------------------------------------------
    const quoteSaleRes = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookie)
      .send({
        docType: 'QUOTE',
        locationId,
        customerId,
        items: [{ productId: prodAId, quantity: 5, unitPrice: 1100.0, taxRatePercent: 10 }],
        notes: 'Special volume quote',
      });
    expect(quoteSaleRes.status).toBe(201);
    const quoteSaleId = quoteSaleRes.body.data._id;

    const quoteDocRes = await request(app)
      .get(`/api/v1/documents/quote/${quoteSaleId}`)
      .set('Cookie', cookie);
    expect(quoteDocRes.status).toBe(200);
    expect(quoteDocRes.body.data.documentType).toBe('QUOTE');
    expect(quoteDocRes.body.data.title).toBe('PRICE QUOTATION');
    expect(quoteDocRes.body.data.totals.subtotal).toBe(5500.0);
    expect(quoteDocRes.body.data.totals.grandTotal).toBe(6050.0);

    // -------------------------------------------------------------
    // TEST 3: PURCHASE ORDER & SUPPLIER BILL
    // -------------------------------------------------------------
    const poRes = await request(app)
      .post('/api/v1/purchases/orders')
      .set('Cookie', cookie)
      .send({
        supplierId,
        locationId,
        items: [{ productId: prodAId, orderedQuantity: 10, unitCost: 700.0, taxRatePercent: 5 }],
        notes: 'Urgent batch for Q3 replenishment',
      });
    expect(poRes.status).toBe(201);
    const poId = poRes.body.data._id;

    const poDocRes = await request(app)
      .get(`/api/v1/documents/purchase-order/${poId}`)
      .set('Cookie', cookie);
    expect(poDocRes.status).toBe(200);
    expect(poDocRes.body.data.documentType).toBe('PURCHASE_ORDER');
    expect(poDocRes.body.data.recipient.name).toBe('Global Microchips Inc');
    expect(poDocRes.body.data.totals.subtotal).toBe(7000.0);
    expect(poDocRes.body.data.totals.taxTotal).toBe(350.0);
    expect(poDocRes.body.data.totals.grandTotal).toBe(7350.0);

    // Receive Goods & Generate Supplier Bill
    const receiveRes = await request(app)
      .post('/api/v1/purchases/receive')
      .set('Cookie', cookie)
      .send({
        purchaseOrderId: poId,
        supplierInvoiceNumber: 'INV-MICRO-2026-99',
        items: [{ productId: prodAId, quantityReceived: 10, unitCost: 700.0 }],
      });
    expect(receiveRes.status).toBe(201);
    const billId = receiveRes.body.data.bill._id;

    const billDocRes = await request(app)
      .get(`/api/v1/documents/supplier-bill/${billId}`)
      .set('Cookie', cookie);
    expect(billDocRes.status).toBe(200);
    expect(billDocRes.body.data.documentType).toBe('SUPPLIER_BILL');
    expect(billDocRes.body.data.referenceNumber).toBe('INV-MICRO-2026-99');
    expect(billDocRes.body.data.totals.grandTotal).toBe(7000.0);

    // -------------------------------------------------------------
    // TEST 4: DELIVERY NOTE / PACKING SLIP
    // -------------------------------------------------------------
    const deliveryDocRes = await request(app)
      .get(`/api/v1/documents/delivery-note/${saleId}`)
      .set('Cookie', cookie);
    expect(deliveryDocRes.status).toBe(200);
    expect(deliveryDocRes.body.data.documentType).toBe('DELIVERY_NOTE');
    expect(deliveryDocRes.body.data.title).toContain('DELIVERY NOTE');
    expect(deliveryDocRes.body.data.items.length).toBe(2);

    // -------------------------------------------------------------
    // TEST 5: CREDIT NOTE (SALES RETURN)
    // -------------------------------------------------------------
    const returnRes = await request(app)
      .post('/api/v1/sales/returns')
      .set('Cookie', cookie)
      .send({
        originalSaleId: saleId,
        items: [{ productId: prodBId, quantity: 2, returnReason: 'Surplus items' }],
        refundPaymentMethod: 'CASH',
        reason: 'Customer returned 2 patch cables',
      });
    expect(returnRes.status).toBe(201);
    const returnId = returnRes.body.data._id;

    const creditNoteDocRes = await request(app)
      .get(`/api/v1/documents/credit-note/${returnId}`)
      .set('Cookie', cookie);
    expect(creditNoteDocRes.status).toBe(200);
    expect(creditNoteDocRes.body.data.documentType).toBe('CREDIT_NOTE');
    expect(creditNoteDocRes.body.data.title).toContain('CREDIT NOTE');
    expect(creditNoteDocRes.body.data.totals.grandTotal).toBe(30.0); // 2 * $15 = $30

    // -------------------------------------------------------------
    // TEST 6: CUSTOMER STATEMENT OF ACCOUNT
    // -------------------------------------------------------------
    const statementRes = await request(app)
      .get(`/api/v1/documents/customer-statement/${customerId}`)
      .set('Cookie', cookie);
    expect(statementRes.status).toBe(200);
    expect(statementRes.body.data.documentType).toBe('CUSTOMER_STATEMENT');
    expect(statementRes.body.data.recipient.name).toBe('Wayne Tech Industries');
    expect(statementRes.body.data.statementTransactions).toBeDefined();

    // -------------------------------------------------------------
    // TEST 7: PRINTABLE RESPONSIVE HTML FORMAT
    // -------------------------------------------------------------
    const htmlRes = await request(app)
      .get(`/api/v1/documents/invoice/${saleId}?format=html`)
      .set('Cookie', cookie);
    expect(htmlRes.status).toBe(200);
    expect(htmlRes.headers['content-type']).toContain('text/html');
    expect(htmlRes.text).toContain('<!DOCTYPE html>');
    expect(htmlRes.text).toContain('Acme Global Enterprises');
    expect(htmlRes.text).toContain('US-TAX-889922-Z');
    expect(htmlRes.text).toContain('Wayne Tech Industries');
    expect(htmlRes.text).toContain('Enterprise Cloud Server Rack');
    expect(htmlRes.text).toContain('window.print()');
    expect(htmlRes.text).toContain('@media print');
  });

  it('should enforce strict tenant isolation for document generation', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantA_doc@company.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A Docs',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'tenantB_doc@company.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B Docs',
      });
    const cookieB = regB.headers['set-cookie'];

    // Create a sale in Tenant A
    const locResA = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookieA)
      .send({ name: 'Location A', code: 'LOC-A' });
    const locA = locResA.body.data._id;

    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookieA)
      .send({ name: 'Secret Blueprint A', sku: 'BLUE-A', sellingPrice: 500.0 });
    const prodAId = prodA.body.data._id;

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookieA)
      .send({ locationId: locA, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 5 });

    const saleA = await request(app)
      .post('/api/v1/sales')
      .set('Cookie', cookieA)
      .send({
        locationId: locA,
        items: [{ productId: prodAId, quantity: 1, unitPrice: 500.0 }],
      });
    expect(saleA.status).toBe(201);
    const saleAId = saleA.body.data._id;

    // Tenant B attempts to generate Tenant A's Invoice document
    const unauthorizedAccess = await request(app)
      .get(`/api/v1/documents/invoice/${saleAId}`)
      .set('Cookie', cookieB);

    expect(unauthorizedAccess.status).toBe(404); // Tenant isolation guarantees 404 Not Found
  });
});
