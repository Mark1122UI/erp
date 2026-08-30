import {
  IntegrationProviderType,
  IExternalProduct,
  IExternalOrder,
  IExternalCustomer,
} from '../integration.types.js';
import { IIntegrationConnection, IIntegrationCredential } from '../integration.model.js';

export interface OAuthCallbackResult {
  credentials: {
    accessToken?: string;
    refreshToken?: string;
    apiKey?: string;
    apiSecret?: string;
    webhookSecret?: string;
    tokenExpiresAt?: Date;
    scope?: string;
  };
  name?: string;
  storeUrl?: string;
}

export interface IIntegrationProviderAdapter {
  readonly provider: IntegrationProviderType;

  getAuthUrl(tenantId: string, redirectUri: string, state?: string, storeName?: string): Promise<string>;

  handleOAuthCallback(params: {
    code: string;
    state?: string;
    shop?: string;
    redirectUri?: string;
  }): Promise<OAuthCallbackResult>;

  testConnection(connection: IIntegrationConnection, credentials: IIntegrationCredential): Promise<boolean>;

  fetchProducts(connection: IIntegrationConnection, credentials: IIntegrationCredential): Promise<IExternalProduct[]>;

  fetchOrders(connection: IIntegrationConnection, credentials: IIntegrationCredential): Promise<IExternalOrder[]>;

  fetchCustomers(connection: IIntegrationConnection, credentials: IIntegrationCredential): Promise<IExternalCustomer[]>;

  pushInventory(
    connection: IIntegrationConnection,
    credentials: IIntegrationCredential,
    items: { externalId: string; sku: string; quantity: number }[]
  ): Promise<{ successCount: number; failureCount: number }>;
}
