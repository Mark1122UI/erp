import mongoose, { Schema, Document } from 'mongoose';
import { PaymentMethod } from '../sales/sale.model.js';

// -------------------------------------------------------------
// EXPENSE MODEL
// -------------------------------------------------------------
export interface IExpense extends Document {
  tenantId: mongoose.Types.ObjectId;
  expenseNumber: string; // e.g. 'EXP-00001'
  category: string; // e.g. 'RENT', 'UTILITIES', 'SALARIES', 'MARKETING', 'OFFICE_SUPPLIES', 'MAINTENANCE', 'OTHER'
  amount: number;
  currency: string;
  paymentMethod: PaymentMethod;
  expenseDate: Date;
  reference?: string;
  notes?: string;
  attachmentUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ExpenseSchema = new Schema<IExpense>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    expenseNumber: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      trim: true,
      default: 'OTHER',
      index: true,
    },
    amount: { type: Number, required: true, min: 0.01 },
    currency: { type: String, default: 'USD', uppercase: true },
    paymentMethod: {
      type: String,
      enum: ['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER'],
      default: 'CASH',
    },
    expenseDate: { type: Date, default: Date.now, index: true },
    reference: { type: String, trim: true },
    notes: { type: String },
    attachmentUrl: { type: String },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

ExpenseSchema.index({ tenantId: 1, expenseNumber: 1 }, { unique: true });
ExpenseSchema.index({ tenantId: 1, expenseDate: -1 });

export const Expense = mongoose.model<IExpense>('Expense', ExpenseSchema);

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Rent & Lease',
  'Utilities & Power',
  'Salaries & Wages',
  'Marketing & Advertising',
  'Office Supplies',
  'Maintenance & Repairs',
  'Logistics & Delivery',
  'Software & Subscriptions',
  'Taxes & Licenses',
  'Miscellaneous / Other',
];
