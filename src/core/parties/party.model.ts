import mongoose, { Schema, Document } from 'mongoose';

export type PartyType = 'INDIVIDUAL' | 'ORGANIZATION';

export type PartyRole =
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'DISTRIBUTOR'
  | 'CONTRACTOR'
  | 'PARTNER'
  | 'OTHER';

export interface IAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface IPartyNote {
  _id?: mongoose.Types.ObjectId;
  content: string;
  authorId?: mongoose.Types.ObjectId;
  authorName: string;
  createdAt: Date;
}

export interface IPartyActivity {
  _id?: mongoose.Types.ObjectId;
  type: string; // e.g. 'NOTE_ADDED', 'DETAILS_UPDATED', 'ROLE_ADDED', 'PAYMENT_RECORDED'
  title: string;
  description?: string;
  performedBy?: string;
  createdAt: Date;
}

export interface ICustomerDetails {
  creditLimit: number;
  paymentTermsDays: number;
  currentBalance: number; // Positive means customer owes business
  totalSpend: number;
  priceTier?: string;
  taxExempt?: boolean;
}

export interface ISupplierDetails {
  defaultPaymentTermsDays: number;
  currentBalance: number; // Positive means business owes supplier
  totalPurchased: number;
  bankDetails?: {
    bankName?: string;
    accountNumber?: string;
    routingCode?: string;
  };
}

export interface IPartyTransaction {
  _id?: mongoose.Types.ObjectId;
  transactionNumber: string;
  type: 'INVOICE' | 'PAYMENT' | 'BILL' | 'PURCHASE' | 'REFUND' | 'CREDIT_NOTE';
  amount: number;
  currency: string;
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'VOID';
  reference?: string;
  date: Date;
  description?: string;
}

export interface IParty extends Document {
  tenantId: mongoose.Types.ObjectId;
  type: PartyType;
  roles: PartyRole[];
  displayName: string;
  
  // Individual specifics
  salutation?: string;
  firstName?: string;
  lastName?: string;

  // Organization specifics
  companyName?: string;
  taxNumber?: string;
  website?: string;
  industry?: string;

  // Contact Details
  email?: string;
  phone?: string;
  mobile?: string;
  billingAddress?: IAddress;
  shippingAddress?: IAddress;

  // Role details
  customerDetails?: ICustomerDetails;
  supplierDetails?: ISupplierDetails;

  // Sub-records & History
  notes: IPartyNote[];
  activities: IPartyActivity[];
  transactions: IPartyTransaction[];

  tags: string[];
  isArchived: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const AddressSchema = new Schema<IAddress>(
  {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  { _id: false }
);

const NoteSchema = new Schema<IPartyNote>(
  {
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: 'User' },
    authorName: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const ActivitySchema = new Schema<IPartyActivity>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: String,
    performedBy: String,
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const TransactionSchema = new Schema<IPartyTransaction>(
  {
    transactionNumber: { type: String, required: true },
    type: {
      type: String,
      enum: ['INVOICE', 'PAYMENT', 'BILL', 'PURCHASE', 'REFUND', 'CREDIT_NOTE'],
      required: true,
    },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'USD' },
    status: {
      type: String,
      enum: ['PAID', 'PENDING', 'OVERDUE', 'VOID'],
      default: 'PENDING',
    },
    reference: String,
    date: { type: Date, default: Date.now },
    description: String,
  },
  { _id: true }
);

const PartySchema = new Schema<IParty>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    type: { type: String, enum: ['INDIVIDUAL', 'ORGANIZATION'], default: 'INDIVIDUAL', required: true },
    roles: [
      {
        type: String,
        enum: ['CUSTOMER', 'SUPPLIER', 'DISTRIBUTOR', 'CONTRACTOR', 'PARTNER', 'OTHER'],
        required: true,
      },
    ],
    displayName: { type: String, required: true, trim: true, index: true },
    salutation: { type: String, trim: true },
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    companyName: { type: String, trim: true, index: true },
    taxNumber: { type: String, trim: true },
    website: { type: String, trim: true },
    industry: { type: String, trim: true },
    email: { type: String, lowercase: true, trim: true, index: true },
    phone: { type: String, trim: true, index: true },
    mobile: { type: String, trim: true },
    billingAddress: AddressSchema,
    shippingAddress: AddressSchema,
    customerDetails: {
      creditLimit: { type: Number, default: 0 },
      paymentTermsDays: { type: Number, default: 0 },
      currentBalance: { type: Number, default: 0 },
      totalSpend: { type: Number, default: 0 },
      priceTier: { type: String, default: 'STANDARD' },
      taxExempt: { type: Boolean, default: false },
    },
    supplierDetails: {
      defaultPaymentTermsDays: { type: Number, default: 30 },
      currentBalance: { type: Number, default: 0 },
      totalPurchased: { type: Number, default: 0 },
      bankDetails: {
        bankName: String,
        accountNumber: String,
        routingCode: String,
      },
    },
    notes: [NoteSchema],
    activities: [ActivitySchema],
    transactions: [TransactionSchema],
    tags: [{ type: String, trim: true }],
    isArchived: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

// Compound indexes for high-speed multi-tenant party searches
PartySchema.index({ tenantId: 1, roles: 1, isArchived: 1, createdAt: -1 });
PartySchema.index({ tenantId: 1, displayName: 1 });
PartySchema.index({ tenantId: 1, email: 1 });
PartySchema.index({ tenantId: 1, phone: 1 });
PartySchema.index({ tenantId: 1, 'customerDetails.currentBalance': 1 });
PartySchema.index({ tenantId: 1, 'supplierDetails.currentBalance': 1 });

export const Party = mongoose.model<IParty>('Party', PartySchema);
