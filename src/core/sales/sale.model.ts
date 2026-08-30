import mongoose, { Schema, Document } from 'mongoose';

export type SaleDocType = 'QUOTE' | 'ORDER' | 'INVOICE' | 'RETURN';
export type SaleStatus = 'DRAFT' | 'CONFIRMED' | 'PAID' | 'PARTIALLY_PAID' | 'COMPLETED' | 'CANCELLED' | 'REFUNDED';
export type PaymentMethod = 'CASH' | 'CARD' | 'BANK_TRANSFER' | 'CREDIT' | 'OTHER';
export type PaymentStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED';

// -------------------------------------------------------------
// 1. SALE LINE ITEM SCHEMA
// -------------------------------------------------------------
export interface ISaleLineItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  costPrice: number;
  discountAmount: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

const SaleLineItemSchema = new Schema<ISaleLineItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    quantity: { type: Number, required: true, min: 0.001 },
    unitPrice: { type: Number, required: true, min: 0 },
    costPrice: { type: Number, default: 0, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    taxRatePercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

// -------------------------------------------------------------
// 2. SALE PAYMENT SCHEMA
// -------------------------------------------------------------
export interface ISalePayment {
  _id?: mongoose.Types.ObjectId;
  paymentNumber: string;
  amount: number;
  paymentMethod: PaymentMethod;
  provider: string; // 'CASH_DRAWER', 'MANUAL_TERMINAL', 'STRIPE', 'BANK_TRANSFER'
  reference?: string; // Card last 4, Auth code, Transaction ID, Check #
  tenderedAmount?: number; // E.g. Given $50 for a $42.50 total
  changeAmount?: number; // E.g. $7.50 change returned
  status: PaymentStatus;
  notes?: string;
  createdAt: Date;
}

const SalePaymentSchema = new Schema<ISalePayment>(
  {
    paymentNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'],
      required: true,
    },
    provider: { type: String, default: 'MANUAL' },
    reference: { type: String },
    tenderedAmount: { type: Number },
    changeAmount: { type: Number },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED'],
      default: 'COMPLETED',
    },
    notes: { type: String },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

// -------------------------------------------------------------
// 3. SALE / INVOICE MODEL
// -------------------------------------------------------------
export interface ISale extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  saleNumber: string; // e.g. 'INV-00001' or 'ORD-00001'
  docType: SaleDocType;
  status: SaleStatus;
  currency: string;
  
  // Safe Financial Totals
  subtotal: number;
  discountTotal: number;
  taxTotal: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;

  items: ISaleLineItem[];
  payments: ISalePayment[];

  clientReferenceId?: string;
  offlineSyncedAt?: Date;

  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SaleSchema = new Schema<ISale>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Party', index: true },
    customerName: { type: String, default: 'Walk-in Customer', trim: true },
    saleNumber: { type: String, required: true, trim: true },
    docType: {
      type: String,
      enum: ['QUOTE', 'ORDER', 'INVOICE', 'RETURN'],
      default: 'INVOICE',
      index: true,
    },
    status: {
      type: String,
      enum: ['DRAFT', 'CONFIRMED', 'PAID', 'PARTIALLY_PAID', 'COMPLETED', 'CANCELLED', 'REFUNDED'],
      default: 'PAID',
      index: true,
    },
    currency: { type: String, default: 'USD', uppercase: true },

    subtotal: { type: Number, required: true, default: 0 },
    discountTotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },
    paidAmount: { type: Number, required: true, default: 0 },
    dueAmount: { type: Number, required: true, default: 0 },

    items: [SaleLineItemSchema],
    payments: [SalePaymentSchema],

    clientReferenceId: { type: String, trim: true },
    offlineSyncedAt: { type: Date },

    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SaleSchema.index({ tenantId: 1, saleNumber: 1 }, { unique: true });
SaleSchema.index(
  { tenantId: 1, clientReferenceId: 1 },
  { unique: true, partialFilterExpression: { clientReferenceId: { $type: 'string' } } }
);
SaleSchema.index({ tenantId: 1, createdAt: -1 });
SaleSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
SaleSchema.index({ tenantId: 1, customerId: 1, createdAt: -1 });
SaleSchema.index({ tenantId: 1, locationId: 1, createdAt: -1 });

export const Sale = mongoose.model<ISale>('Sale', SaleSchema);

// -------------------------------------------------------------
// 4. SALES RETURN MODEL
// -------------------------------------------------------------
export interface IReturnItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  refundAmount: number;
}

export interface ISalesReturn extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  originalSaleId: mongoose.Types.ObjectId;
  originalSaleNumber: string;
  returnNumber: string; // e.g. 'RET-00001'
  customerId?: mongoose.Types.ObjectId;
  customerName: string;
  items: IReturnItem[];
  totalRefundAmount: number;
  refundPaymentMethod: PaymentMethod;
  reason?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SalesReturnSchema = new Schema<ISalesReturn>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    originalSaleId: { type: Schema.Types.ObjectId, ref: 'Sale', required: true, index: true },
    originalSaleNumber: { type: String, required: true },
    returnNumber: { type: String, required: true },
    customerId: { type: Schema.Types.ObjectId, ref: 'Party' },
    customerName: { type: String, default: 'Walk-in Customer' },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        sku: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        unitPrice: { type: Number, required: true },
        refundAmount: { type: Number, required: true },
      },
    ],
    totalRefundAmount: { type: Number, required: true, min: 0 },
    refundPaymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'],
      default: 'CASH',
    },
    reason: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SalesReturnSchema.index({ tenantId: 1, returnNumber: 1 }, { unique: true });

export const SalesReturn = mongoose.model<ISalesReturn>('SalesReturn', SalesReturnSchema);
