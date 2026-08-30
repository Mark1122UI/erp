import mongoose, { Schema, Document } from 'mongoose';
import {
  IntegrationProviderType,
  ConnectionStatus,
  SyncType,
  SyncDirection,
  SyncStatus,
  IntegrationLogLevel,
  MappableEntityType,
} from './integration.types.js';

// -------------------------------------------------------------
// 1. INTEGRATION CONNECTION MODEL
// -------------------------------------------------------------
export interface IIntegrationConnection extends Document {
  tenantId: mongoose.Types.ObjectId;
  provider: IntegrationProviderType;
  name: string; // e.g. "Main Shopify US Store"
  storeUrl?: string;
  status: ConnectionStatus;
  lastSyncAt?: Date;
  settings: {
    autoSyncOrders?: boolean;
    autoSyncInventory?: boolean;
    syncIntervalMinutes?: number;
    defaultLocationId?: mongoose.Types.ObjectId;
    priceTier?: string;
    customWebhookUrl?: string;
  };
  errorMessage?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationConnectionSchema = new Schema<IIntegrationConnection>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    provider: {
      type: String,
      enum: ['SHOPIFY', 'WOOCOMMERCE', 'CUSTOM_API', 'MARKETPLACE'],
      required: true,
      index: true,
    },
    name: { type: String, required: true, trim: true },
    storeUrl: { type: String, trim: true },
    status: {
      type: String,
      enum: ['ACTIVE', 'DISCONNECTED', 'ERROR', 'SYNCING'],
      default: 'ACTIVE',
      index: true,
    },
    lastSyncAt: { type: Date },
    settings: {
      autoSyncOrders: { type: Boolean, default: true },
      autoSyncInventory: { type: Boolean, default: true },
      syncIntervalMinutes: { type: Number, default: 15 },
      defaultLocationId: { type: Schema.Types.ObjectId, ref: 'Location' },
      priceTier: { type: String },
      customWebhookUrl: { type: String },
    },
    errorMessage: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

IntegrationConnectionSchema.index({ tenantId: 1, provider: 1 });

export const IntegrationConnection = mongoose.model<IIntegrationConnection>(
  'IntegrationConnection',
  IntegrationConnectionSchema
);

// -------------------------------------------------------------
// 2. INTEGRATION CREDENTIAL MODEL (SECURE)
// -------------------------------------------------------------
export interface IIntegrationCredential extends Document {
  tenantId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  accessToken?: string;
  refreshToken?: string;
  apiKey?: string;
  apiSecret?: string;
  webhookSecret?: string;
  tokenExpiresAt?: Date;
  scope?: string;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationCredentialSchema = new Schema<IIntegrationCredential>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: 'IntegrationConnection', required: true, unique: true, index: true },
    accessToken: { type: String, select: false }, // Never selected by default to protect secrets
    refreshToken: { type: String, select: false },
    apiKey: { type: String, select: false },
    apiSecret: { type: String, select: false },
    webhookSecret: { type: String, select: false },
    tokenExpiresAt: { type: Date },
    scope: { type: String },
  },
  { timestamps: true }
);

export const IntegrationCredential = mongoose.model<IIntegrationCredential>(
  'IntegrationCredential',
  IntegrationCredentialSchema
);

// -------------------------------------------------------------
// 3. INTEGRATION MAPPING MODEL
// -------------------------------------------------------------
export interface IIntegrationMapping extends Document {
  tenantId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  entityType: MappableEntityType;
  erpId: mongoose.Types.ObjectId;
  externalId: string;
  externalSku?: string;
  metadata?: Record<string, any>;
  lastSyncedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationMappingSchema = new Schema<IIntegrationMapping>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: 'IntegrationConnection', required: true, index: true },
    entityType: {
      type: String,
      enum: ['PRODUCT', 'ORDER', 'CUSTOMER', 'INVENTORY'],
      required: true,
      index: true,
    },
    erpId: { type: Schema.Types.ObjectId, required: true, index: true },
    externalId: { type: String, required: true, index: true },
    externalSku: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    lastSyncedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

IntegrationMappingSchema.index(
  { tenantId: 1, connectionId: 1, entityType: 1, externalId: 1 },
  { unique: true }
);
IntegrationMappingSchema.index(
  { tenantId: 1, connectionId: 1, entityType: 1, erpId: 1 }
);

export const IntegrationMapping = mongoose.model<IIntegrationMapping>(
  'IntegrationMapping',
  IntegrationMappingSchema
);

// -------------------------------------------------------------
// 4. INTEGRATION SYNC JOB MODEL
// -------------------------------------------------------------
export interface IIntegrationSync extends Document {
  tenantId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  syncType: SyncType;
  direction: SyncDirection;
  status: SyncStatus;
  itemsProcessed: number;
  itemsSucceeded: number;
  itemsFailed: number;
  errorMessages: string[];
  details?: Record<string, any>;
  startedAt: Date;
  completedAt?: Date;
  triggeredBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const IntegrationSyncSchema = new Schema<IIntegrationSync>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: 'IntegrationConnection', required: true, index: true },
    syncType: {
      type: String,
      enum: ['PRODUCTS', 'INVENTORY', 'ORDERS', 'CUSTOMERS', 'FULL'],
      required: true,
      index: true,
    },
    direction: {
      type: String,
      enum: ['INBOUND', 'OUTBOUND', 'BIDIRECTIONAL'],
      default: 'INBOUND',
    },
    status: {
      type: String,
      enum: ['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED', 'PARTIAL'],
      default: 'PENDING',
      index: true,
    },
    itemsProcessed: { type: Number, default: 0 },
    itemsSucceeded: { type: Number, default: 0 },
    itemsFailed: { type: Number, default: 0 },
    errorMessages: [{ type: String }],
    details: { type: Schema.Types.Mixed },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    triggeredBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

IntegrationSyncSchema.index({ tenantId: 1, connectionId: 1, createdAt: -1 });

export const IntegrationSync = mongoose.model<IIntegrationSync>(
  'IntegrationSync',
  IntegrationSyncSchema
);

// -------------------------------------------------------------
// 5. INTEGRATION LOG MODEL
// -------------------------------------------------------------
export interface IIntegrationLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  connectionId: mongoose.Types.ObjectId;
  syncId?: mongoose.Types.ObjectId;
  level: IntegrationLogLevel;
  event: string;
  message: string;
  payload?: any;
  error?: any;
  createdAt: Date;
}

const IntegrationLogSchema = new Schema<IIntegrationLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    connectionId: { type: Schema.Types.ObjectId, ref: 'IntegrationConnection', required: true, index: true },
    syncId: { type: Schema.Types.ObjectId, ref: 'IntegrationSync', index: true },
    level: {
      type: String,
      enum: ['INFO', 'WARN', 'ERROR'],
      default: 'INFO',
      index: true,
    },
    event: { type: String, required: true },
    message: { type: String, required: true },
    payload: { type: Schema.Types.Mixed },
    error: { type: Schema.Types.Mixed },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

IntegrationLogSchema.index({ tenantId: 1, connectionId: 1, createdAt: -1 });

export const IntegrationLog = mongoose.model<IIntegrationLog>(
  'IntegrationLog',
  IntegrationLogSchema
);
