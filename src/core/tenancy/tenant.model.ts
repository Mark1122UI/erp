import mongoose, { Schema, Document } from 'mongoose';

export interface ITenantAddress {
  street?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface ITenantSettings {
  taxNumber?: string;
  receiptHeader?: string;
  receiptFooter?: string;
  allowNegativeStock?: boolean;
  
  // Taxes
  defaultTaxRate?: number;
  pricesIncludeTax?: boolean;
  taxRates?: Array<{
    name: string;
    rate: number;
    isDefault?: boolean;
    code?: string;
  }>;

  // Receipt
  receiptShowLogo?: boolean;
  receiptShowTax?: boolean;
  receiptShowBarcode?: boolean;
  receiptWidth?: '58mm' | '80mm';
  receiptTerms?: string;

  // Invoice
  invoicePrefix?: string;
  nextInvoiceNumber?: number;
  paymentTerms?: string;
  invoiceDefaultNotes?: string;
  invoiceBankDetails?: string;
  invoiceDueDays?: number;

  // Currency & Locale
  currencySymbol?: string;
  currencyPosition?: 'before' | 'after';
  decimalPlaces?: number;
  thousandSeparator?: string;
  decimalSeparator?: string;

  // Notifications
  emailAlertsEnabled?: boolean;
  lowStockAlertThreshold?: number;
  lowStockEmailRecipient?: string;
  dailySalesSummaryEmail?: boolean;
  orderNotificationsEnabled?: boolean;

  // Integrations
  apiKey?: string;
  webhookUrl?: string;
  shopifyConnected?: boolean;
  stripeConnected?: boolean;
  quickbooksConnected?: boolean;
  webhookEvents?: string[];

  // Security
  sessionTimeoutMinutes?: number;
  twoFactorRequired?: boolean;
  passwordExpiryDays?: number;

  // Advanced (Separated)
  customCss?: string;
  webhookSecret?: string;
  rawConfigJson?: string;
  debugMode?: boolean;
}

export interface ITenant extends Document {
  name: string;
  slug: string;
  country: string;
  currency: string;
  timezone: string;
  businessType: string;
  phone?: string;
  email?: string;
  address?: ITenantAddress;
  logoUrl?: string;
  isSetupComplete: boolean;
  activeModules: string[];
  plan: 'STARTER' | 'GROWTH' | 'ENTERPRISE';
  settings?: ITenantSettings;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const TenantSchema = new Schema<ITenant>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    country: { type: String, default: 'US' },
    currency: { type: String, default: 'USD' },
    timezone: { type: String, default: 'UTC' },
    businessType: {
      type: String,
      enum: ['RETAIL', 'ECOMMERCE', 'HYBRID_RETAIL', 'SERVICES', 'MANUFACTURING', 'HEALTHCARE', 'CONSTRUCTION', 'OTHER'],
      default: 'HYBRID_RETAIL',
    },
    phone: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    address: {
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    logoUrl: { type: String },
    isSetupComplete: { type: Boolean, default: false },
    activeModules: [{ type: String, default: ['core', 'retail', 'ecommerce'] }],
    plan: { type: String, enum: ['STARTER', 'GROWTH', 'ENTERPRISE'], default: 'STARTER' },
    settings: {
      taxNumber: String,
      receiptHeader: String,
      receiptFooter: String,
      allowNegativeStock: { type: Boolean, default: false },
      
      // Taxes
      defaultTaxRate: { type: Number, default: 0 },
      pricesIncludeTax: { type: Boolean, default: false },
      taxRates: [
        {
          name: String,
          rate: Number,
          isDefault: Boolean,
          code: String,
        },
      ],

      // Receipt
      receiptShowLogo: { type: Boolean, default: true },
      receiptShowTax: { type: Boolean, default: true },
      receiptShowBarcode: { type: Boolean, default: true },
      receiptWidth: { type: String, default: '80mm' },
      receiptTerms: String,

      // Invoice
      invoicePrefix: { type: String, default: 'INV-' },
      nextInvoiceNumber: { type: Number, default: 1001 },
      paymentTerms: { type: String, default: 'DUE_ON_RECEIPT' },
      invoiceDefaultNotes: String,
      invoiceBankDetails: String,
      invoiceDueDays: { type: Number, default: 14 },

      // Currency & Locale
      currencySymbol: { type: String, default: '$' },
      currencyPosition: { type: String, enum: ['before', 'after'], default: 'before' },
      decimalPlaces: { type: Number, default: 2 },
      thousandSeparator: { type: String, default: ',' },
      decimalSeparator: { type: String, default: '.' },

      // Notifications
      emailAlertsEnabled: { type: Boolean, default: true },
      lowStockAlertThreshold: { type: Number, default: 5 },
      lowStockEmailRecipient: String,
      dailySalesSummaryEmail: { type: Boolean, default: false },
      orderNotificationsEnabled: { type: Boolean, default: true },

      // Integrations
      apiKey: String,
      webhookUrl: String,
      shopifyConnected: { type: Boolean, default: false },
      stripeConnected: { type: Boolean, default: false },
      quickbooksConnected: { type: Boolean, default: false },
      webhookEvents: [String],

      // Security
      sessionTimeoutMinutes: { type: Number, default: 1440 },
      twoFactorRequired: { type: Boolean, default: false },
      passwordExpiryDays: { type: Number, default: 90 },

      // Advanced
      customCss: String,
      webhookSecret: String,
      rawConfigJson: String,
      debugMode: { type: Boolean, default: false },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Tenant = mongoose.model<ITenant>('Tenant', TenantSchema);
