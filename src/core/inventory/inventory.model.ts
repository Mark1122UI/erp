import mongoose, { Schema, Document } from 'mongoose';

// -------------------------------------------------------------
// 1. LOCATION MODEL (Store, Warehouse, Branch)
// -------------------------------------------------------------
export type LocationType = 'STORE' | 'WAREHOUSE' | 'BRANCH' | 'OTHER';

export interface ILocation extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  code: string; // e.g. 'MAIN-STORE', 'CENTRAL-WH'
  type: LocationType;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    type: {
      type: String,
      enum: ['STORE', 'WAREHOUSE', 'BRANCH', 'OTHER'],
      default: 'STORE',
    },
    address: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },
    isDefault: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

LocationSchema.index({ tenantId: 1, code: 1 }, { unique: true });
LocationSchema.index({ tenantId: 1, isActive: 1 });

export const Location = mongoose.model<ILocation>('Location', LocationSchema);

// -------------------------------------------------------------
// 2. INVENTORY ITEM (Stock Level per Location & Product)
// -------------------------------------------------------------
export interface IInventoryItem extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantityOnHand: number;
  quantityReserved: number;
  reorderPoint: number;
  lastCostPrice: number;
  averageCostPrice: number;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryItemSchema = new Schema<IInventoryItem>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId },
    quantityOnHand: { type: Number, required: true, default: 0 },
    quantityReserved: { type: Number, required: true, default: 0 },
    reorderPoint: { type: Number, default: 5 },
    lastCostPrice: { type: Number, default: 0 },
    averageCostPrice: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Compound Unique Index: One stock level record per tenant + location + product + variant
InventoryItemSchema.index(
  { tenantId: 1, locationId: 1, productId: 1, variantId: 1 },
  { unique: true }
);
InventoryItemSchema.index({ tenantId: 1, locationId: 1, quantityOnHand: 1 });

export const InventoryItem = mongoose.model<IInventoryItem>('InventoryItem', InventoryItemSchema);

// -------------------------------------------------------------
// 3. INVENTORY TRANSACTION (Immutable Ledger of All Stock Moves)
// -------------------------------------------------------------
export type InventoryTransactionType =
  | 'OPENING_BALANCE'
  | 'PURCHASE'
  | 'SALE'
  | 'RETURN'
  | 'TRANSFER_IN'
  | 'TRANSFER_OUT'
  | 'ADJUSTMENT'
  | 'DAMAGE';

export interface IInventoryTransaction extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  transactionType: InventoryTransactionType;
  quantityDelta: number; // Positive (+) for stock in, Negative (-) for stock out
  balanceAfter: number;
  costPerUnit: number;
  referenceType?: string; // 'PURCHASE_ORDER', 'SALE_INVOICE', 'TRANSFER', 'ADJUSTMENT', 'MANUAL'
  referenceId?: string;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const InventoryTransactionSchema = new Schema<IInventoryTransaction>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId },
    transactionType: {
      type: String,
      enum: [
        'OPENING_BALANCE',
        'PURCHASE',
        'SALE',
        'RETURN',
        'TRANSFER_IN',
        'TRANSFER_OUT',
        'ADJUSTMENT',
        'DAMAGE',
      ],
      required: true,
      index: true,
    },
    quantityDelta: { type: Number, required: true },
    balanceAfter: { type: Number, required: true },
    costPerUnit: { type: Number, default: 0 },
    referenceType: { type: String, trim: true },
    referenceId: { type: String, trim: true },
    notes: { type: String, trim: true },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

InventoryTransactionSchema.index({ tenantId: 1, locationId: 1, productId: 1, createdAt: -1 });
InventoryTransactionSchema.index({ tenantId: 1, createdAt: -1 });

export const InventoryTransaction = mongoose.model<IInventoryTransaction>(
  'InventoryTransaction',
  InventoryTransactionSchema
);

// -------------------------------------------------------------
// 4. STOCK ADJUSTMENT MODEL (Audited Stock Count / Correction)
// -------------------------------------------------------------
export type AdjustmentReason =
  | 'PHYSICAL_COUNT'
  | 'DAMAGED_EXPIRED'
  | 'FOUND_STOCK'
  | 'THEFT_LOSS'
  | 'INTERNAL_USE'
  | 'CORRECTION';

export interface IAdjustmentItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  previousQty: number;
  newQty: number;
  deltaQty: number;
  unitCost: number;
}

export interface IStockAdjustment extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  adjustmentNumber: string;
  reason: AdjustmentReason;
  items: IAdjustmentItem[];
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockAdjustmentSchema = new Schema<IStockAdjustment>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    adjustmentNumber: { type: String, required: true },
    reason: {
      type: String,
      enum: [
        'PHYSICAL_COUNT',
        'DAMAGED_EXPIRED',
        'FOUND_STOCK',
        'THEFT_LOSS',
        'INTERNAL_USE',
        'CORRECTION',
      ],
      required: true,
    },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Schema.Types.ObjectId },
        previousQty: { type: Number, required: true },
        newQty: { type: Number, required: true },
        deltaQty: { type: Number, required: true },
        unitCost: { type: Number, default: 0 },
      },
    ],
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

StockAdjustmentSchema.index({ tenantId: 1, adjustmentNumber: 1 }, { unique: true });

export const StockAdjustment = mongoose.model<IStockAdjustment>(
  'StockAdjustment',
  StockAdjustmentSchema
);

// -------------------------------------------------------------
// 5. STOCK TRANSFER MODEL (Multi-Location Transit Workflow)
// -------------------------------------------------------------
export type TransferStatus = 'DRAFT' | 'CONFIRMED' | 'TRANSFERRED_OUT' | 'COMPLETED' | 'CANCELLED';

export interface ITransferItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  quantity: number;
}

export interface IStockTransfer extends Document {
  tenantId: mongoose.Types.ObjectId;
  transferNumber: string;
  sourceLocationId: mongoose.Types.ObjectId;
  destinationLocationId: mongoose.Types.ObjectId;
  items: ITransferItem[];
  status: TransferStatus;
  transferredOutAt?: Date;
  transferredInAt?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockTransferSchema = new Schema<IStockTransfer>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    transferNumber: { type: String, required: true },
    sourceLocationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    destinationLocationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        variantId: { type: Schema.Types.ObjectId },
        quantity: { type: Number, required: true, min: 1 },
      },
    ],
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED', 'TRANSFERRED_OUT', 'COMPLETED', 'CANCELLED'],
      default: 'DRAFT',
      index: true,
    },
    transferredOutAt: { type: Date },
    transferredInAt: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

StockTransferSchema.index({ tenantId: 1, transferNumber: 1 }, { unique: true });

export const StockTransfer = mongoose.model<IStockTransfer>('StockTransfer', StockTransferSchema);
