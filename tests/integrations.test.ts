import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { IntegrationConnection, IntegrationCredential, IntegrationMapping, IntegrationLog } from '../src/core/integrations/integration.model.js';
import { Product } from '../src/core/catalog/product.model.js';
import { Sale } from '../src/core/sales/sale.model.js';
import { Party } from '../src/core/parties/party.model.js';

describe('18. E-commerce Integration Framework (Shopify, WooCommerce, Custom API)', () => {
  it('should support provider catalog, OAuth connect flow, credential security, multi-entity sync, and integration logs', async () => {
    // 1. Register Owner
    const regRes = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'founder@hyperstore.com',
        password: 'Password123!',
        firstName: 'Elena',
        lastName: 'Rostova',
        businessName: 'HyperStore Retail Corp',
      });
    const cookie = regRes.headers['set-cookie'];

    // Create default Location for incoming orders
    await request(app)
      .post('/api/v1/inventory/locations')
      .set('Cookie', cookie)
      .send({ name: 'E-commerce Fulfillment Hub', code: 'ECOM-01', isDefault: true });

    // -------------------------------------------------------------
    // 1. PROVIDER CATALOG DISCOVERY
    // -------------------------------------------------------------
    const catalogRes = await request(app)
      .get('/api/v1/integrations/providers')
      .set('Cookie', cookie);

    expect(catalogRes.status).toBe(200);
    expect(catalogRes.body.data.length).toBeGreaterThanOrEqual(3);
    const shopifyProvider = catalogRes.body.data.find((p: any) => p.id === 'SHOPIFY');
    expect(shopifyProvider).toBeDefined();
    expect(shopifyProvider.capabilities).toContain('PRODUCTS');
    expect(shopifyProvider.capabilities).toContain('ORDERS');
    expect(shopifyProvider.capabilities).toContain('INVENTORY');

    // -------------------------------------------------------------
    // 2. OAUTH AUTHORIZATION INITIATION
    // -------------------------------------------------------------
    const authUrlRes = await request(app)
      .get('/api/v1/integrations/oauth/authorize?provider=SHOPIFY&storeName=hyperstore-us.myshopify.com')
      .set('Cookie', cookie);

    expect(authUrlRes.status).toBe(200);
    expect(authUrlRes.body.data.authUrl).toContain('https://hyperstore-us.myshopify.com/admin/oauth/authorize');
    expect(authUrlRes.body.data.authUrl).toContain('client_id=universal_erp_shopify_client');

    // -------------------------------------------------------------
    // 3. OAUTH CALLBACK & STORE CONNECTION
    // -------------------------------------------------------------
    const callbackRes = await request(app)
      .get('/api/v1/integrations/oauth/callback?provider=SHOPIFY&code=test_oauth_auth_code_9988&shop=hyperstore-us.myshopify.com')
      .set('Cookie', cookie);

    expect(callbackRes.status).toBe(201);
    expect(callbackRes.body.data.provider).toBe('SHOPIFY');
    expect(callbackRes.body.data.status).toBe('ACTIVE');
    const connectionId = callbackRes.body.data._id;

    // -------------------------------------------------------------
    // 4. SECURITY CHECK: NEVER EXPOSE ACCESS TOKENS TO FRONTEND
    // -------------------------------------------------------------
    const getConnRes = await request(app)
      .get(`/api/v1/integrations/connections/${connectionId}`)
      .set('Cookie', cookie);

    expect(getConnRes.status).toBe(200);
    expect(getConnRes.body.data.accessToken).toBeUndefined();
    expect(getConnRes.body.data.apiKey).toBeUndefined();
    expect(getConnRes.body.data.apiSecret).toBeUndefined();

    // Verify token exists securely in database
    const secureCred = await IntegrationCredential.findOne({ connectionId }).select('+accessToken');
    expect(secureCred).toBeDefined();
    expect(secureCred?.accessToken).toMatch(/^shpat_mock_/);

    // -------------------------------------------------------------
    // 5. TRIGGER FULL SYNCHRONIZATION (Products, Customers, Orders, Inventory)
    // -------------------------------------------------------------
    const syncRes = await request(app)
      .post(`/api/v1/integrations/connections/${connectionId}/sync`)
      .set('Cookie', cookie)
      .send({ syncType: 'FULL' });

    expect(syncRes.status).toBe(200);
    expect(syncRes.body.data.status).toBe('COMPLETED');
    expect(syncRes.body.data.itemsSucceeded).toBeGreaterThanOrEqual(3);
    expect(syncRes.body.data.errors.length).toBe(0);

    // Verify Product created from Shopify
    const syncedProduct = await Product.findOne({ sku: 'SHP-WH-101' });
    expect(syncedProduct).toBeDefined();
    expect(syncedProduct?.name).toBe('Shopify Premium Wireless Headphones');
    expect(syncedProduct?.sellingPrice).toBe(199.99);

    // Verify Product Mapping exists
    const prodMapping = await IntegrationMapping.findOne({
      connectionId,
      entityType: 'PRODUCT',
      externalId: 'shopify_prod_101',
    });
    expect(prodMapping).toBeDefined();
    expect(prodMapping?.erpId.toString()).toBe(syncedProduct?._id.toString());

    // Verify Customer created from Shopify
    const syncedCustomer = await Party.findOne({ email: 'sarah@resistance.org' });
    expect(syncedCustomer).toBeDefined();
    expect(syncedCustomer?.displayName).toBe('Sarah Connor');

    // Verify Order created from Shopify
    const syncedOrder = await Sale.findOne({ docType: 'ORDER' });
    expect(syncedOrder).toBeDefined();
    expect(syncedOrder?.customerName).toBe('Sarah Connor');
    expect(syncedOrder?.grandTotal).toBe(199.99);
    expect(syncedOrder?.status).toBe('PAID');

    // -------------------------------------------------------------
    // 6. INTEGRATION LOGS AUDIT
    // -------------------------------------------------------------
    const logsRes = await request(app)
      .get(`/api/v1/integrations/connections/${connectionId}/logs`)
      .set('Cookie', cookie);

    expect(logsRes.status).toBe(200);
    expect(logsRes.body.data.length).toBeGreaterThanOrEqual(2);
    const events = logsRes.body.data.map((l: any) => l.event);
    expect(events).toContain('STORE_CONNECTED');
    expect(events).toContain('SYNC_STARTED');
    expect(events).toContain('SYNC_COMPLETED');
  });

  it('should enforce strict tenant isolation for e-commerce connections and sync operations', async () => {
    // Tenant A
    const regA = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerA_ecom@co.com',
        password: 'Password123!',
        firstName: 'Alice',
        lastName: 'A',
        businessName: 'Business A Storefront',
      });
    const cookieA = regA.headers['set-cookie'];

    // Tenant B
    const regB = await request(app)
      .post('/api/v1/auth/register')
      .send({
        email: 'ownerB_ecom@co.com',
        password: 'Password123!',
        firstName: 'Bob',
        lastName: 'B',
        businessName: 'Business B Storefront',
      });
    const cookieB = regB.headers['set-cookie'];

    // Connect WooCommerce in Tenant A
    const connA = await request(app)
      .post('/api/v1/integrations/connections')
      .set('Cookie', cookieA)
      .send({
        provider: 'WOOCOMMERCE',
        name: 'Alice Secret Boutique',
        storeUrl: 'https://alice-boutique.com',
        apiKey: 'ck_secret_123',
        apiSecret: 'cs_secret_456',
      });
    const connAId = connA.body.data._id;

    // Tenant B attempts to read Tenant A's connection
    const unauthGet = await request(app)
      .get(`/api/v1/integrations/connections/${connAId}`)
      .set('Cookie', cookieB);
    expect(unauthGet.status).toBe(404);

    // Tenant B attempts to trigger sync on Tenant A's connection
    const unauthSync = await request(app)
      .post(`/api/v1/integrations/connections/${connAId}/sync`)
      .set('Cookie', cookieB)
      .send({ syncType: 'FULL' });
    expect(unauthSync.status).toBe(404);

    // Tenant B attempts to read Tenant A's integration logs
    const unauthLogs = await request(app)
      .get(`/api/v1/integrations/connections/${connAId}/logs`)
      .set('Cookie', cookieB);
    expect(unauthLogs.status).toBe(200);
    expect(unauthLogs.body.data.length).toBe(0); // Tenant isolation returns empty array
  });
});
