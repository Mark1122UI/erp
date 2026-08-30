import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from '../sales/sale.model.js';

export type PurchaseOrderStatus = 'DRAFT' | 'ORDERED' | 'PARTIALLY_RECEIVED' | 'RECEIVED' | 'CANCELLED';
export type SupplierBillStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';

// -------------------------------------------------------------
// 1. PURCHASE ORDER LINE ITEM
// -------------------------------------------------------------
export interface IPurchaseOrderItem {
  _id?: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  orderedQuantity: number;
  receivedQuantity: number;
  unitCost: number;
  taxRatePercent: number;
  taxAmount: number;
  lineTotal: number;
}

const PurchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    orderedQuantity: { type: Number, required: true, min: 0.001 },
    receivedQuantity: { type: Number, required: true, default: 0, min: 0 },
    unitCost: { type: Number, required: true, min: 0 },
    taxRatePercent: { type: Number, default: 0, min: 0 },
    taxAmount: { type: Number, default: 0, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: true }
);

// -------------------------------------------------------------
// 2. PURCHASE ORDER MODEL
// -------------------------------------------------------------
export interface IPurchaseOrder extends Document {
  tenantId: mongoose.Types.ObjectId;
  locationId: mongoose.Types.ObjectId;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  purchaseOrderNumber: string; // e.g. 'PO-00001'
  status: PurchaseOrderStatus;
  currency: string;
  
  subtotal: number;
  taxTotal: number;
  grandTotal: number;

  items: IPurchaseOrderItem[];
  notes?: string;
  orderDate: Date;
  expectedDeliveryDate?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PurchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true, index: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    supplierName: { type: String, required: true, trim: true },
    purchaseOrderNumber: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ['DRAFT', 'ORDERED', 'PARTIALLY_RECEIVED', 'RECEIVED', 'CANCELLED'],
      default: 'ORDERED',
      index: true,
    },
    currency: { type: String, default: 'USD', uppercase: true },

    subtotal: { type: Number, required: true, default: 0 },
    taxTotal: { type: Number, required: true, default: 0 },
    grandTotal: { type: Number, required: true, default: 0 },

    items: [PurchaseOrderItemSchema],
    notes: { type: String },
    orderDate: { type: Date, default: Date.now },
    expectedDeliveryDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

PurchaseOrderSchema.index({ tenantId: 1, purchaseOrderNumber: 1 }, { unique: true });
PurchaseOrderSchema.index({ tenantId: 1, status: 1, createdAt: -1 });
PurchaseOrderSchema.index({ tenantId: 1, supplierId: 1, createdAt: -1 });

export const PurchaseOrder = mongoose.model<IPurchaseOrder>('PurchaseOrder', PurchaseOrderSchema);

// -------------------------------------------------------------
// 3. GOODS RECEIPT (STOCK RECEIVING LOG)
// -------------------------------------------------------------
export interface IGoodsReceiptItem {
  productId: mongoose.Types.ObjectId;
  name: string;
  sku: string;
  quantityReceived: number;
  unitCost: number;
}

export interface IGoodsReceipt extends Document {
  tenantId: mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId;
  purchaseOrderNumber?: string;
  receiptNumber: string; // e.g. 'GRN-00001'
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  locationId: mongoose.Types.ObjectId;
  items: IGoodsReceiptItem[];
  notes?: string;
  receivedAt: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const GoodsReceiptSchema = new Schema<IGoodsReceipt>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    purchaseOrderNumber: { type: String },
    receiptNumber: { type: String, required: true },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    supplierName: { type: String, required: true },
    locationId: { type: Schema.Types.ObjectId, ref: 'Location', required: true },
    items: [
      {
        productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
        name: { type: String, required: true },
        sku: { type: String, required: true },
        quantityReceived: { type: Number, required: true, min: 0.001 },
        unitCost: { type: Number, default: 0 },
      },
    ],
    notes: { type: String },
    receivedAt: { type: Date, default: Date.now },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

GoodsReceiptSchema.index({ tenantId: 1, receiptNumber: 1 }, { unique: true });

export const GoodsReceipt = mongoose.model<IGoodsReceipt>('GoodsReceipt', GoodsReceiptSchema);

// -------------------------------------------------------------
// 4. SUPPLIER BILL MODEL
// -------------------------------------------------------------
export interface ISupplierBillPayment {
  _id?: mongoose.Types.ObjectId;
  paymentNumber: string;
  amount: number;
  paymentMethod: string;
  reference?: string;
  paymentDate: Date;
  notes?: string;
  createdAt: Date;
}

const SupplierBillPaymentSchema = new Schema<ISupplierBillPayment>(
  {
    paymentNumber: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    paymentMethod: { type: String, default: 'BANK_TRANSFER' },
    reference: { type: String },
    paymentDate: { type: Date, default: Date.now },
    notes: { type: String },
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

export interface ISupplierBill extends Document {
  tenantId: mongoose.Types.ObjectId;
  purchaseOrderId?: mongoose.Types.ObjectId;
  purchaseOrderNumber?: string;
  supplierId: mongoose.Types.ObjectId;
  supplierName: string;
  billNumber: string; // e.g. 'BILL-00001'
  supplierInvoiceNumber?: string; // Vendor's invoice number
  status: 'UNPAID' | 'PARTIALLY_PAID' | 'PAID' | 'VOID';
  currency: string;

  totalAmount: number;
  paidAmount: number;
  dueAmount: number;

  payments: ISupplierBillPayment[];

  billDate: Date;
  dueDate?: Date;
  notes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SupplierBillSchema = new Schema<ISupplierBill>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    purchaseOrderId: { type: Schema.Types.ObjectId, ref: 'PurchaseOrder' },
    purchaseOrderNumber: { type: String },
    supplierId: { type: Schema.Types.ObjectId, ref: 'Party', required: true, index: true },
    supplierName: { type: String, required: true },
    billNumber: { type: String, required: true },
    supplierInvoiceNumber: { type: String },
    status: {
      type: String,
      enum: ['UNPAID', 'PARTIALLY_PAID', 'PAID', 'VOID'],
      default: 'UNPAID',
      index: true,
    },
    currency: { type: String, default: 'USD', uppercase: true },

    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, required: true, default: 0, min: 0 },
    dueAmount: { type: Number, required: true, min: 0 },

    payments: [SupplierBillPaymentSchema],

    billDate: { type: Date, default: Date.now },
    dueDate: { type: Date },
    notes: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

SupplierBillSchema.index({ tenantId: 1, billNumber: 1 }, { unique: true });
SupplierBillSchema.index({ tenantId: 1, supplierId: 1, status: 1 });
SupplierBillSchema.index({ tenantId: 1, supplierId: 1, createdAt: -1 });
SupplierBillSchema.index({ tenantId: 1, status: 1, createdAt: -1 });

export const SupplierBill = mongoose.model<ISupplierBill>('SupplierBill', SupplierBillSchema);
