import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';

describe('Phase 17: First-Time Owner Onboarding, Settings & Setup Checklist', () => {
  async function createBusinessOwner(email = 'owner@retailmart.com', businessName = 'RetailMart Superstore') {
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email,
        password: 'SecurePassword123!',
        firstName: 'Alice',
        lastName: 'Smith',
        businessName,
        country: 'US',
        currency: 'USD',
      });

    return {
      cookie: regRes.headers['set-cookie'],
      tenant: regRes.body.data.tenant,
      user: regRes.body.data.user,
    };
  }

  it('Step 0: Verify initial setup checklist is incomplete right after signup', async () => {
    const { cookie } = await createBusinessOwner('check@retail.com', 'Check Superstore');

    const checkRes = await request(app)
      .get('/api/v1/business/checklist')
      .set('Cookie', cookie);

    expect(checkRes.status).toBe(200);
    expect(checkRes.body.success).toBe(true);
    const checklist = checkRes.body.data;
    expect(checklist.isSetupComplete).toBe(false);
    expect(checklist.businessProfile).toBe(true); // Has name, country, currency
    expect(checklist.products).toBe(false);
    expect(checklist.openingStock).toBe(false);
    expect(checklist.percentComplete).toBeLessThan(100);
    expect(checklist.items.length).toBe(4);
  });

  it('Step 1 to 5: Execute 5-step streamlined onboarding with products and opening stock', async () => {
    const { cookie } = await createBusinessOwner('onboard@retail.com', 'Onboarding Retail');

    const onboardingRes = await request(app)
      .post('/api/v1/business/onboarding')
      .set('Cookie', cookie)
      .send({
        business: {
          name: 'RetailMart Global',
          businessType: 'RETAIL',
          phone: '+1-555-0199',
          email: 'hello@retailmart.com',
          address: {
            street: '123 Market St',
            city: 'San Francisco',
            state: 'CA',
            postalCode: '94103',
            country: 'US',
          },
        },
        location: {
          name: 'San Francisco Flagship',
          code: 'SF-MAIN',
        },
        products: [
          {
            name: 'Organic Earl Grey Tea',
            sku: 'TEA-EG-01',
            barcode: '789012345678',
            sellingPrice: 12.99,
            costPrice: 5.5,
            categoryName: 'Beverages',
            initialStock: 50,
          },
          {
            name: 'Stainless Steel Water Bottle',
            sku: 'BOT-SS-01',
            barcode: '789012345679',
            sellingPrice: 24.5,
            costPrice: 10.0,
            categoryName: 'Accessories',
            initialStock: 30,
          },
        ],
        markComplete: true,
      });

    expect(onboardingRes.status).toBe(200);
    expect(onboardingRes.body.success).toBe(true);
    expect(onboardingRes.body.data.productsCreated).toBe(2);
    expect(onboardingRes.body.data.tenant.isSetupComplete).toBe(true);

    // Verify updated checklist now has 100% completion
    const checklistRes = await request(app)
      .get('/api/v1/business/checklist')
      .set('Cookie', cookie);

    expect(checklistRes.status).toBe(200);
    const checklist = checklistRes.body.data;
    expect(checklist.businessProfile).toBe(true);
    expect(checklist.location).toBe(true);
    expect(checklist.products).toBe(true);
    expect(checklist.openingStock).toBe(true);
    expect(checklist.isSetupComplete).toBe(true);
    expect(checklist.percentComplete).toBe(100);
    expect(checklist.completedSteps).toBe(4);
  });

  it('1-Click Starter Sample Data Pack: load sample catalog and inventory', async () => {
    const { cookie } = await createBusinessOwner('bob@cafebistro.com', 'Cafe Bistro');

    const sampleRes = await request(app)
      .post('/api/v1/business/sample-data')
      .set('Cookie', cookie);

    expect(sampleRes.status).toBe(200);
    expect(sampleRes.body.success).toBe(true);
    expect(sampleRes.body.data.checklist.products).toBe(true);
    expect(sampleRes.body.data.checklist.openingStock).toBe(true);
  });

  it('Settings Hub: Retrieve all categorized settings including separated Advanced section', async () => {
    const { cookie } = await createBusinessOwner('settings@retail.com', 'Settings Retail');

    const res = await request(app)
      .get('/api/v1/business/settings')
      .set('Cookie', cookie);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    const settings = res.body.data;

    // Verify all 11+ categories exist
    expect(settings.business).toBeDefined();
    expect(settings.business.name).toBe('Settings Retail');
    expect(settings.taxes).toBeDefined();
    expect(settings.currency).toBeDefined();
    expect(settings.receipt).toBeDefined();
    expect(settings.invoice).toBeDefined();
    expect(settings.notifications).toBeDefined();
    expect(settings.integrations).toBeDefined();
    expect(settings.security).toBeDefined();
    expect(settings.advanced).toBeDefined(); // Separated advanced section
    expect(settings.locations).toBeInstanceOf(Array);
    expect(settings.roles).toBeInstanceOf(Array);
  });

  it('Settings Hub: Update individual categories (Taxes, Receipt, Invoice, Notifications, Security, Advanced)', async () => {
    const { cookie } = await createBusinessOwner('update@retail.com', 'Update Retail');

    // 1. Update Taxes
    const taxRes = await request(app)
      .patch('/api/v1/business/settings/taxes')
      .set('Cookie', cookie)
      .send({
        taxNumber: 'US-TAX-998877',
        defaultTaxRate: 8.5,
        pricesIncludeTax: true,
      });
    expect(taxRes.status).toBe(200);
    expect(taxRes.body.data.taxes.taxNumber).toBe('US-TAX-998877');
    expect(taxRes.body.data.taxes.defaultTaxRate).toBe(8.5);
    expect(taxRes.body.data.taxes.pricesIncludeTax).toBe(true);

    // 2. Update Receipt
    const rcptRes = await request(app)
      .patch('/api/v1/business/settings/receipt')
      .set('Cookie', cookie)
      .send({
        header: 'Welcome to RetailMart SF Flagship',
        footer: 'Save your receipt for returns within 30 days',
        showBarcode: true,
        width: '80mm',
      });
    expect(rcptRes.status).toBe(200);
    expect(rcptRes.body.data.receipt.header).toBe('Welcome to RetailMart SF Flagship');

    // 3. Update Invoice
    const invRes = await request(app)
      .patch('/api/v1/business/settings/invoice')
      .set('Cookie', cookie)
      .send({
        prefix: 'RM-INV-',
        nextNumber: 5001,
        paymentTerms: 'NET_30',
        dueDays: 30,
      });
    expect(invRes.status).toBe(200);
    expect(invRes.body.data.invoice.prefix).toBe('RM-INV-');
    expect(invRes.body.data.invoice.nextNumber).toBe(5001);

    // 4. Update Notifications
    const notifRes = await request(app)
      .patch('/api/v1/business/settings/notifications')
      .set('Cookie', cookie)
      .send({
        lowStockAlertThreshold: 10,
        lowStockEmailRecipient: 'alerts@retailmart.com',
        dailySalesSummaryEmail: true,
      });
    expect(notifRes.status).toBe(200);
    expect(notifRes.body.data.notifications.lowStockAlertThreshold).toBe(10);
    expect(notifRes.body.data.notifications.dailySalesSummaryEmail).toBe(true);

    // 5. Update Security
    const secRes = await request(app)
      .patch('/api/v1/business/settings/security')
      .set('Cookie', cookie)
      .send({
        sessionTimeoutMinutes: 720,
        twoFactorRequired: false,
      });
    expect(secRes.status).toBe(200);
    expect(secRes.body.data.security.sessionTimeoutMinutes).toBe(720);

    // 6. Update Advanced settings (separated)
    const advRes = await request(app)
      .patch('/api/v1/business/settings/advanced')
      .set('Cookie', cookie)
      .send({
        allowNegativeStock: true,
        debugMode: true,
      });
    expect(advRes.status).toBe(200);
    expect(advRes.body.data.advanced.allowNegativeStock).toBe(true);
    expect(advRes.body.data.advanced.debugMode).toBe(true);
  });

  it('Roles & Permissions: Retrieve system role descriptions and permission matrix', async () => {
    const { cookie } = await createBusinessOwner('roles@retail.com', 'Roles Retail');

    const rolesRes = await request(app)
      .get('/api/v1/business/roles')
      .set('Cookie', cookie);

    expect(rolesRes.status).toBe(200);
    expect(rolesRes.body.success).toBe(true);
    const roles = rolesRes.body.data;
    expect(roles.length).toBeGreaterThanOrEqual(7);

    const ownerRole = roles.find((r: any) => r.role === 'Owner');
    expect(ownerRole).toBeDefined();
    expect(ownerRole.permissions.length).toBeGreaterThan(15);

    const cashierRole = roles.find((r: any) => r.role === 'Cashier');
    expect(cashierRole).toBeDefined();
    expect(cashierRole.permissions).toContain('pos:access');
  });
});
