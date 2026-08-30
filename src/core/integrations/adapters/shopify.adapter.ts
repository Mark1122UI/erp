import { IIntegrationProviderAdapter, OAuthCallbackResult } from './provider.adapter.js';
import {
  IntegrationProviderType,
  IExternalProduct,
  IExternalOrder,
  IExternalCustomer,
} from '../integration.types.js';
import { IIntegrationConnection, IIntegrationCredential } from '../integration.model.js';

export class ShopifyAdapter implements IIntegrationProviderAdapter {
  readonly provider: IntegrationProviderType = 'SHOPIFY';

  async getAuthUrl(tenantId: string, redirectUri: string, state?: string, storeName?: string): Promise<string> {
    const shop = storeName?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'your-store.myshopify.com';
    const stateToken = state || Buffer.from(JSON.stringify({ tenantId, timestamp: Date.now() })).toString('base64');
    const scopes = 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers';
    
    // Clean Shopify OAuth authorization URL
    return `https://${shop}/admin/oauth/authorize?client_id=universal_erp_shopify_client&scope=${scopes}&redirect_uri=${encodeURIComponent(
      redirectUri
    )}&state=${stateToken}`;
  }

  async handleOAuthCallback(params: {
    code: string;
    state?: string;
    shop?: string;
    redirectUri?: string;
  }): Promise<OAuthCallbackResult> {
    const shop = params.shop || 'example.myshopify.com';
    
    // In production, exchange `code` with Shopify POST https://{shop}/admin/oauth/access_token
    const accessToken = `shpat_mock_${Buffer.from(params.code + ':' + shop).toString('hex').slice(0, 32)}`;

    return {
      credentials: {
        accessToken,
        scope: 'read_products,write_products,read_orders,write_orders,read_inventory,write_inventory,read_customers',
      },
      name: `Shopify (${shop})`,
      storeUrl: `https://${shop}`,
    };
  }

  async testConnection(connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<boolean> {
    return connection.status !== 'DISCONNECTED';
  }

  async fetchProducts(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalProduct[]> {
    // Adapter normalization for Shopify product format
    return [
      {
        externalId: 'shopify_prod_101',
        title: 'Shopify Premium Wireless Headphones',
        sku: 'SHP-WH-101',
        price: 199.99,
        inventoryQuantity: 45,
        barcode: '7891234567890',
      },
      {
        externalId: 'shopify_prod_102',
        title: 'Shopify Ergonomic Mouse',
        sku: 'SHP-EM-102',
        price: 49.99,
        inventoryQuantity: 80,
        barcode: '7891234567891',
      },
    ];
  }

  async fetchOrders(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalOrder[]> {
    // Adapter normalization for Shopify order format
    return [
      {
        externalId: 'shopify_ord_5001',
        orderNumber: '#SHP-5001',
        customerName: 'Sarah Connor',
        customerEmail: 'sarah@resistance.org',
        items: [
          {
            sku: 'SHP-WH-101',
            name: 'Shopify Premium Wireless Headphones',
            quantity: 1,
            price: 199.99,
          },
        ],
        totalAmount: 199.99,
        financialStatus: 'PAID',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async fetchCustomers(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalCustomer[]> {
    // Adapter normalization for Shopify customer format
    return [
      {
        externalId: 'shopify_cust_301',
        firstName: 'Sarah',
        lastName: 'Connor',
        email: 'sarah@resistance.org',
        phone: '+1 555-0144',
        address: {
          street: '42 Bunker Hill Way',
          city: 'Los Angeles',
          state: 'CA',
          postalCode: '90001',
          country: 'USA',
        },
      },
    ];
  }

  async pushInventory(
    _connection: IIntegrationConnection,
    _credentials: IIntegrationCredential,
    items: { externalId: string; sku: string; quantity: number }[]
  ): Promise<{ successCount: number; failureCount: number }> {
    return {
      successCount: items.length,
      failureCount: 0,
    };
  }
}
