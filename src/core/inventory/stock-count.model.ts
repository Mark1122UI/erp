import mongoose, { Schema, Document } from 'mongoose';

export type StockCountStatus = 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';

export interface IStockCountItem {
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  systemQuantity: number;
  countedQuantity: number;
  difference: number; // countedQuantity - systemQuantity
  unitCost: number;
}

const StockCountItemSchema = new Schema<IStockCountItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    systemQuantity: { type: Number, required: true, default: 0 },
    countedQuantity: { type: Number, required: true, default: 0, min: 0 },
    difference: { type: Number, required: true, default: 0 },
    unitCost: { type: Number, required: true, default: 0, min: 0 },
  },
  { _id: true }
);

export interface IStockCount extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  countNumber: string; // e.g. 'CNT-00001'
  status: StockCountStatus;
  items: IStockCountItem[];
  totalDiscrepancyValue: number;
  notes?: string;
  startedAt: Date;
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const StockCountSchema = new Schema<IStockCount>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    countNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'IN_PROGRESS',
      index: true,
    },
    items: [StockCountItemSchema],
    totalDiscrepancyValue: { type: Number, default: 0 },
    notes: { type: String },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

StockCountSchema.index({ tenantId: 1, countNumber: 1 }, { unique: true });
StockCountSchema.index({ tenantId: 1, locationId: 1, status: 1 });

export const StockCount = mongoose.model<IStockCount>('StockCount', StockCountSchema);
