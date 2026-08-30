import { IIntegrationProviderAdapter, OAuthCallbackResult } from './provider.adapter.js';
import {
  IntegrationProviderType,
  IExternalProduct,
  IExternalOrder,
  IExternalCustomer,
} from '../integration.types.js';
import { IIntegrationConnection, IIntegrationCredential } from '../integration.model.js';

export class CustomApiAdapter implements IIntegrationProviderAdapter {
  readonly provider: IntegrationProviderType = 'CUSTOM_API';

  async getAuthUrl(_tenantId: string, redirectUri: string): Promise<string> {
    return redirectUri;
  }

  async handleOAuthCallback(_params: any): Promise<OAuthCallbackResult> {
    return {
      credentials: {
        apiKey: `key_custom_${Date.now()}`,
        webhookSecret: `whsec_${Date.now()}`,
      },
      name: 'Custom Webhook / API Store',
    };
  }

  async testConnection(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<boolean> {
    return true;
  }

  async fetchProducts(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalProduct[]> {
    return [];
  }

  async fetchOrders(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalOrder[]> {
    return [];
  }

  async fetchCustomers(_connection: IIntegrationConnection, _credentials: IIntegrationCredential): Promise<IExternalCustomer[]> {
    return [];
  }

  async pushInventory(
    _connection: IIntegrationConnection,
    _credentials: IIntegrationCredential,
    items: { externalId: string; sku: string; quantity: number }[]
  ): Promise<{ successCount: number; failureCount: number }> {
    return { successCount: items.length, failureCount: 0 };
  }
}
