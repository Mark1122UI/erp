import mongoose from 'mongoose';

export type IntegrationProviderType = 'SHOPIFY' | 'WOOCOMMERCE' | 'CUSTOM_API' | 'MARKETPLACE';
export type ConnectionStatus = 'ACTIVE' | 'DISCONNECTED' | 'ERROR' | 'SYNCING';
export type SyncType = 'PRODUCTS' | 'INVENTORY' | 'ORDERS' | 'CUSTOMERS' | 'FULL';
export type SyncDirection = 'INBOUND' | 'OUTBOUND' | 'BIDIRECTIONAL';
export type SyncStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PARTIAL';
export type IntegrationLogLevel = 'INFO' | 'WARN' | 'ERROR';
export type MappableEntityType = 'PRODUCT' | 'ORDER' | 'CUSTOMER' | 'INVENTORY';

export interface IProviderCatalogItem {
  id: IntegrationProviderType;
  name: string;
  description: string;
  category: 'ECOMMERCE' | 'MARKETPLACE' | 'CUSTOM';
  authType: 'OAUTH2' | 'API_KEY' | 'WEBHOOK';
  capabilities: ('PRODUCTS' | 'INVENTORY' | 'ORDERS' | 'CUSTOMERS' | 'WEBHOOKS')[];
  logoUrl?: string;
  docsUrl?: string;
}

export interface ISyncResult {
  syncId: string;
  status: SyncStatus;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  errors: string[];
  details?: Record<string, any>;
}

export interface IExternalProduct {
  externalId: string;
  title: string;
  sku: string;
  price: number;
  inventoryQuantity?: number;
  barcode?: string;
}

export interface IExternalOrder {
  externalId: string;
  orderNumber: string;
  customerName: string;
  customerEmail?: string;
  items: {
    sku: string;
    name: string;
    quantity: number;
    price: number;
  }[];
  totalAmount: number;
  financialStatus: string;
  createdAt: string;
}

export interface IExternalCustomer {
  externalId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
}
