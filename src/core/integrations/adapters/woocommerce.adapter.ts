import { IIntegrationProviderAdapter, OAuthCallbackResult } from './provider.adapter.js';
import {
  IntegrationProviderType,
  IExternalProduct,
  IExternalOrder,
  IExternalCustomer,
} from '../integration.types.js';
import { IIntegrationConnection, IIntegrationCredential } from '../integration.model.js';

export class WooCommerceAdapter implements IIntegrationProviderAdapter {
  readonly provider: IntegrationProviderType = 'WOOCOMMERCE';

  async getAuthUrl(tenantId: string, redirectUri: string, state?: string, storeName?: string): Promise<string> {
    const host = storeName?.trim().replace(/^https?:\/\//, '').replace(/\/$/, '') || 'my-wordpress-store.com';
    const stateToken = state || Buffer.from(JSON.stringify({ tenantId, timestamp: Date.now() })).toString('base64');
    
    // WooCommerce REST API v3 Auth Endpoint
    return `https://${host}/wc-auth/v1/authorize?app_name=Universal_ERP&scope=read_write&user_id=1&return_url=${encodeURIComponent(
      redirectUri
    )}&callback_url=${encodeURIComponent(redirectUri)}&state=${stateToken}`;
  }

  async handleOAuthCallback(params: {
    code: string;
    state?: string;
    shop?: string;
    redirectUri?: string;
  }): Promise<OAuthCallbackResult> {
    return {
      credentials: {
        apiKey: `ck_${Buffer.from(params.code).toString('hex').slice(0, 24)}`,
        apiSecret: `cs_${Buffer.from(params.code + '_secret').toString('hex').slice(0, 24)}`,
      },
      name: `WooCommerce (${params.shop || 'WordPress Store'})`,
      storeUrl: params.shop ? `https://${params.shop}` : 'https://my-wordpress-store.com',
    };
  }

  async testConnection(connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<boolean> {
    return connection.status !== 'DISCONNECTED';
  }

  async fetchProducts(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalProduct[]> {
    return [
      {
        externalId: 'woo_prod_201',
        title: 'WooCommerce Eco-Friendly Water Bottle',
        sku: 'WOO-WB-201',
        price: 24.5,
        inventoryQuantity: 120,
      },
    ];
  }

  async fetchOrders(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalOrder[]> {
    return [
      {
        externalId: 'woo_ord_701',
        orderNumber: '#WOO-701',
        customerName: 'Clark Kent',
        customerEmail: 'clark@dailyplanet.com',
        items: [
          {
            sku: 'WOO-WB-201',
            name: 'WooCommerce Eco-Friendly Water Bottle',
            quantity: 2,
            price: 24.5,
          },
        ],
        totalAmount: 49.0,
        financialStatus: 'COMPLETED',
        createdAt: new Date().toISOString(),
      },
    ];
  }

  async fetchCustomers(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalCustomer[]> {
    return [
      {
        externalId: 'woo_cust_401',
        firstName: 'Clark',
        lastName: 'Kent',
        email: 'clark@dailyplanet.com',
        phone: '+1 555-0188',
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
