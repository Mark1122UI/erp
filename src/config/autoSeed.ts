import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../core/identity/user.model.js';
import { Tenant } from '../core/tenancy/tenant.model.js';
import { Location } from '../core/inventory/inventory.model.js';
import { Product } from '../core/catalog/product.model.js';
import { InventoryItem, InventoryTransaction } from '../core/inventory/inventory.model.js';
import { Party } from '../core/parties/party.model.js';
import { Sale } from '../core/sales/sale.model.js';
import { Expense } from '../core/money/money.model.js';
import { ROLE_PERMISSIONS } from '../core/rbac/permissions.js';

export async function autoSeedDemoData() {
  try {
    const existingAdmin = await User.findOne({ email: 'admin@apex.com' });
    if (existingAdmin) {
      return;
    }

    console.log('🌱 Auto-seeding default demo account (admin@apex.com)...');

    const tenantId = new mongoose.Types.ObjectId();
    const userId = new mongoose.Types.ObjectId();

    // 1. Create Tenant
    await Tenant.create({
      _id: tenantId,
      name: 'Apex Superstore Demo',
      slug: 'apex-superstore-demo-main',
      currency: 'USD',
      country: 'US',
      businessType: 'RETAIL',
      ownerId: userId,
      isSetupComplete: true,
      settings: {
        taxes: { defaultTaxRate: 8.0, pricesIncludeTax: false, taxNumber: 'VAT-US-9988' },
        receipt: { header: 'Welcome to Apex Superstore!', footer: 'Thank you for shopping local!', width: '80mm', showBarcode: true },
        notifications: { lowStockAlertThreshold: 10, dailySalesSummaryEmail: true },
        security: { sessionTimeoutMinutes: 1440, passwordExpiryDays: 90, twoFactorRequired: false },
        integrations: { apiKey: 'live_sk_apex_demo_secure_key_12345' },
      },
    });

    // 2. Create User
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash('Password123!', salt);

    await User.create({
      _id: userId,
      email: 'admin@apex.com',
      passwordHash,
      firstName: 'Admin',
      lastName: 'Owner',
      status: 'ACTIVE',
      memberships: [
        {
          tenantId,
          role: 'Owner',
          status: 'ACTIVE',
          permissions: ROLE_PERMISSIONS.Owner,
          joinedAt: new Date(),
        },
      ],
    });

    // 3. Create Store Location
    const locationId = new mongoose.Types.ObjectId();
    await Location.create({
      _id: locationId,
      tenantId,
      name: 'Downtown Main Flagship',
      code: 'STORE-MAIN-01',
      type: 'STORE',
      isDefault: true,
      isActive: true,
    });

    // 4. Create Products & Inventory
    const sampleProducts = [
      { name: 'Colombian Dark Roast Coffee 500g', sku: 'SKU-COF-01', sellingPrice: 18.50, costPrice: 9.00, barcode: '7501234567890', category: 'Beverages', stock: 85 },
      { name: 'Organic Matcha Green Tea 100g', sku: 'SKU-TEA-02', sellingPrice: 24.00, costPrice: 12.00, barcode: '7501234567891', category: 'Beverages', stock: 60 },
      { name: 'Artisan Sourdough Loaf 750g', sku: 'SKU-BAK-03', sellingPrice: 6.50, costPrice: 2.20, barcode: '7501234567892', category: 'Bakery', stock: 40 },
      { name: 'Stainless Steel Insulated Tumbler', sku: 'SKU-MERCH-04', sellingPrice: 28.00, costPrice: 11.50, barcode: '7501234567893', category: 'Merchandise', stock: 30 },
    ];

    const createdProdIds: mongoose.Types.ObjectId[] = [];
    for (const sp of sampleProducts) {
      const prodId = new mongoose.Types.ObjectId();
      createdProdIds.push(prodId);

      await Product.create({
        _id: prodId,
        tenantId,
        name: sp.name,
        sku: sp.sku,
        sellingPrice: sp.sellingPrice,
        costPrice: sp.costPrice,
        categoryName: sp.category,
        taxRatePercent: 8.0,
        isTaxable: true,
        unit: 'UNIT',
        reorderPoint: 15,
        trackInventory: true,
        barcodes: [{ barcode: sp.barcode, symbology: 'EAN13', isPrimary: true }],
      });

      await InventoryItem.create({
        tenantId,
        locationId,
        productId: prodId,
        quantityOnHand: sp.stock,
        quantityAvailable: sp.stock,
        quantityAllocated: 0,
        averageCost: sp.costPrice,
      });

      await InventoryTransaction.create({
        tenantId,
        locationId,
        productId: prodId,
        transactionType: 'OPENING_BALANCE',
        quantityDelta: sp.stock,
        balanceAfter: sp.stock,
        costPerUnit: sp.costPrice,
        createdBy: userId,
        notes: 'Initial inventory load on startup',
      });
    }

    // 5. Create Customer
    const customerId = new mongoose.Types.ObjectId();
    await Party.create({
      _id: customerId,
      tenantId,
      displayName: 'Starlight Bistro & Lounge',
      email: 'claire@starlightbistro.com',
      phone: '+1-555-4422',
      roles: ['CUSTOMER'],
      customerDetails: { creditLimit: 2000, paymentTermsDays: 30 },
    });

    // 6. Create Supplier
    await Party.create({
      tenantId,
      displayName: 'Bean Import Co LLC',
      email: 'orders@beanimport.com',
      phone: '+1-555-8899',
      roles: ['SUPPLIER'],
    });

    // 7. Create Demo POS Sale
    await Sale.create({
      tenantId,
      locationId,
      customerId,
      customerName: 'Starlight Bistro & Lounge',
      saleNumber: 'SALE-10001',
      docType: 'INVOICE',
      status: 'PAID',
      currency: 'USD',
      items: [
        { productId: createdProdIds[0], name: sampleProducts[0].name, sku: sampleProducts[0].sku, quantity: 3, unitPrice: 18.50, taxRatePercent: 8.0, lineTotal: 59.94 },
        { productId: createdProdIds[1], name: sampleProducts[1].name, sku: sampleProducts[1].sku, quantity: 2, unitPrice: 24.00, taxRatePercent: 8.0, lineTotal: 51.84 },
      ],
      subtotal: 103.50,
      discountTotal: 0,
      taxTotal: 8.28,
      taxAmount: 8.28,
      grandTotal: 111.78,
      paidTotal: 111.78,
      balanceDue: 0,
      createdBy: userId,
      payments: [
        {
          paymentNumber: 'PAY-10001',
          amount: 111.78,
          paymentMethod: 'CASH',
          provider: 'MANUAL',
          tenderedAmount: 120.0,
          changeAmount: 8.22,
          status: 'COMPLETED',
        },
      ],
    });

    // 8. Create Demo Expense
    await Expense.create({
      tenantId,
      expenseNumber: 'EXP-00001',
      category: 'Utilities',
      amount: 145.00,
      currency: 'USD',
      paymentMethod: 'CARD',
      createdBy: userId,
      notes: 'Store electricity & heating bill',
    });

    console.log('✅ Demo account ready: admin@apex.com / Password123!');
  } catch (err) {
    console.error('⚠️ Auto-seed error:', err);
  }
}
