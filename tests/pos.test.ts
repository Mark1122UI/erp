import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { Sale } from '../src/core/sales/sale.model.js';
import { InventoryTransaction } from '../src/core/inventory/inventory.model.js';
import { ProductBarcode } from '../src/core/catalog/product.model.js';
import mongoose from 'mongoose';

describe('13. Retail POS Terminal, Barcode Search, Quick Checkout & Sales Engine Integration', () => {
  it('should search products by Name, SKU, and Barcode with real-time stock levels', async () => {
    // 1. Register Merchant
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'pos_cashier@supermarket.com',
        password: 'Password123!',
        firstName: 'Penny',
        lastName: 'POS',
        businessName: 'Express Supermarket & Retail',
      });
    const cookie = reg.headers['set-cookie'];

    // 2. Create Location
    const locRes = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Checkout Terminal 1', code: 'POS-01', isDefault: true });
    const locationId = locRes.body.data._id;

    // 3. Create Products with Barcodes
    const prodA = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Organic Whole Milk 1L',
        sku: 'MILK-ORG-1L',
        sellingPrice: 3.99,
        costPrice: 2.1,
        barcode: '0123456789012',
      });
    const prodAId = prodA.body.data._id;

    const prodB = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({
        name: 'Whole Wheat Bread 500g',
        sku: 'BREAD-WW-500',
        sellingPrice: 2.49,
        costPrice: 1.0,
      });
    const prodBId = prodB.body.data._id;

    // Add secondary barcode for Bread
    const addBarcodeRes = await request(app)
      .post(`/api/v1/products/${prodBId}/barcodes`)
      .set('Cookie', cookie)
      .send({
        barcode: '8801234567890',
        symbology: 'EAN13',
        isPrimary: true,
      });
    expect(addBarcodeRes.status).toBe(201);

    // Add Stock: 50 milks, 30 breads
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodAId, transactionType: 'PURCHASE', quantityDelta: 50 });

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodBId, transactionType: 'PURCHASE', quantityDelta: 30 });

    // 4. Search by Name
    const searchName = await request(app)
      .get(`/api/v1/pos/search?query=Milk&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(searchName.status).toBe(200);
    expect(searchName.body.data.length).toBe(1);
    expect(searchName.body.data[0].sku).toBe('MILK-ORG-1L');
    expect(searchName.body.data[0].quantityOnHand).toBe(50);

    // 5. Search by SKU
    const searchSKU = await request(app)
      .get(`/api/v1/pos/search?query=BREAD-WW-500&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(searchSKU.status).toBe(200);
    expect(searchSKU.body.data.length).toBe(1);
    expect(searchSKU.body.data[0].name).toBe('Whole Wheat Bread 500g');
    expect(searchSKU.body.data[0].quantityOnHand).toBe(30);

    // 6. Search by Secondary Barcode
    const searchBarcode = await request(app)
      .get(`/api/v1/pos/search?query=8801234567890&locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(searchBarcode.status).toBe(200);
    expect(searchBarcode.body.data.length).toBe(1);
    expect(searchBarcode.body.data[0].name).toBe('Whole Wheat Bread 500g');
  });

  it('should process Cash POS checkout with tender/change, decrement stock, and format receipt', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'pos_cash@store.com',
        password: 'Password123!',
        firstName: 'Casey',
        lastName: 'Cashier',
        businessName: 'QuickMart POS',
      });
    const cookie = reg.headers['set-cookie'];

    const loc = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Lane 1', code: 'LANE-01', isDefault: true });
    const locationId = loc.body.data._id;

    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({ name: 'Energy Drink 250ml', sku: 'DRINK-NRG-250', sellingPrice: 2.5, costPrice: 1.0 });
    const prodId = prod.body.data._id;

    // Add 20 drinks to stock
    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodId, transactionType: 'PURCHASE', quantityDelta: 20 });

    // Walk-in / Anonymous POS Sale of 4 drinks ($10.00 total)
    // Customer hands $20 cash, change is $10.00
    const checkoutRes = await request(app)
      .post('/api/v1/pos/checkout')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerName: 'Walk-in Customer',
        items: [{ productId: prodId, quantity: 4 }],
        payments: [
          {
            amount: 10.0,
            paymentMethod: 'CASH',
            tenderedAmount: 20.0,
            changeAmount: 10.0,
          },
        ],
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);

    const { sale, receipt } = checkoutRes.body.data;
    expect(sale.grandTotal).toBe(10.0);
    expect(sale.paidAmount).toBe(10.0);
    expect(sale.status).toBe('PAID');

    // Verify Receipt data structure
    expect(receipt.business.name).toBe('QuickMart POS');
    expect(receipt.sale.grandTotal).toBe(10.0);
    expect(receipt.sale.payments[0].tenderedAmount).toBe(20.0);
    expect(receipt.sale.payments[0].changeAmount).toBe(10.0);

    // Verify stock is automatically decremented from 20 to 16
    const stockList = await request(app)
      .get(`/api/v1/inventory/stock?locationId=${locationId}`)
      .set('Cookie', cookie);
    expect(stockList.body.data.find((i: any) => i.productId === prodId).quantityOnHand).toBe(16);

    // Verify SALE InventoryTransaction created in Universal Core
    const tx = await InventoryTransaction.findOne({ referenceId: sale.saleNumber });
    expect(tx).not.toBeNull();
    expect(tx?.transactionType).toBe('SALE');
    expect(tx?.quantityDelta).toBe(-4);
  });

  it('should process Card checkout with registered customer and track customer spend', async () => {
    const reg = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'pos_card@store.com',
        password: 'Password123!',
        firstName: 'Clara',
        lastName: 'Card',
        businessName: 'Boutique POS',
      });
    const cookie = reg.headers['set-cookie'];

    const cust = await request(app)
      .post('/api/v1/customers')
      .set('Cookie', cookie)
      .send({
        firstName: 'Diana',
        lastName: 'Prince',
        type: 'INDIVIDUAL',
        roles: ['CUSTOMER'],
      });
    const customerId = cust.body.data._id;

    const prod = await request(app)
      .post('/api/v1/products')
      .set('Cookie', cookie)
      .send({ name: 'Silk Scarf', sku: 'SCARF-SILK-01', sellingPrice: 45.0 });
    const prodId = prod.body.data._id;

    const loc = await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'Front Desk', code: 'FRONT-01', isDefault: true });
    const locationId = loc.body.data._id;

    await request(app)
      .post('/api/v1/inventory/movements')
      .set('Cookie', cookie)
      .send({ locationId, productId: prodId, transactionType: 'PURCHASE', quantityDelta: 10 });

    const checkoutRes = await request(app)
      .post('/api/v1/pos/checkout')
      .set('Cookie', cookie)
      .send({
        locationId,
        customerId,
        items: [{ productId: prodId, quantity: 2 }], // $90.00
        payments: [
          {
            amount: 90.0,
            paymentMethod: 'CARD',
            reference: 'AUTH-VISA-99120',
          },
        ],
      });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.data.sale.customerName).toBe('Diana Prince');
    expect(checkoutRes.body.data.sale.grandTotal).toBe(90.0);

    // Verify Customer totalSpend updated in Universal Core
    const customerCheck = await request(app)
      .get(`/api/v1/customers/${customerId}`)
      .set('Cookie', cookie);
    expect(customerCheck.body.data.customerDetails.totalSpend).toBe(90.0);
  });
});
