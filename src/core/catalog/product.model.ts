import mongoose, { Schema, Document } from 'mongoose';

// -------------------------------------------------------------
// 1. UNIT OF MEASURE (UOM) MODEL
// -------------------------------------------------------------
export interface IUnit extends Document {
  tenantId: mongoose.Types.ObjectId;
  code: string; // e.g. 'PCS', 'BOX', 'KG', 'L', 'PACK'
  name: string; // e.g. 'Piece', 'Box', 'Kilogram'
  isDecimalAllowed: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UnitSchema = new Schema<IUnit>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    code: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    isDecimalAllowed: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
UnitSchema.index({ tenantId: 1, code: 1 }, { unique: true });

export const Unit = mongoose.model<IUnit>('Unit', UnitSchema);

// -------------------------------------------------------------
// 2. CATEGORY MODEL
// -------------------------------------------------------------
export interface ICategory extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  slug: string;
  description?: string;
  parentCategoryId?: mongoose.Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CategorySchema = new Schema<ICategory>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, lowercase: true, trim: true },
    description: { type: String },
    parentCategoryId: { type: Schema.Types.ObjectId, ref: 'Category' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);
CategorySchema.index({ tenantId: 1, slug: 1 }, { unique: true });

export const Category = mongoose.model<ICategory>('Category', CategorySchema);

// -------------------------------------------------------------
// 3. PRODUCT VARIANT INTERFACE & SCHEMA
// -------------------------------------------------------------
export interface IProductVariant {
  _id?: mongoose.Types.ObjectId;
  sku: string;
  name: string; // e.g. 'Coca Cola 500ml - Diet' or 'T-Shirt Red XL'
  attributes: Record<string, string>; // e.g. { size: 'XL', color: 'Red' }
  costPrice: number;
  sellingPrice: number;
  reorderPoint?: number;
  isActive: boolean;
}

const ProductVariantSchema = new Schema<IProductVariant>(
  {
    sku: { type: String, required: true, uppercase: true, trim: true },
    name: { type: String, required: true, trim: true },
    attributes: { type: Schema.Types.Mixed, default: {} },
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    reorderPoint: { type: Number, default: 0, min: 0 },
    isActive: { type: Boolean, default: true },
  },
  { _id: true }
);

// -------------------------------------------------------------
// 4. PRODUCT BARCODE MODEL (Separate from SKU - Multi-Barcode)
// -------------------------------------------------------------
export type BarcodeSymbology = 'EAN13' | 'UPC_A' | 'CODE128' | 'CODE39' | 'QR' | 'INTERNAL';

export interface IProductBarcode extends Document {
  tenantId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  variantId?: mongoose.Types.ObjectId;
  barcode: string;
  symbology: BarcodeSymbology;
  isPrimary: boolean;
  description?: string; // e.g. 'Manufacturer Box Barcode' or 'Individual Can Barcode'
  createdAt: Date;
  updatedAt: Date;
}

const ProductBarcodeSchema = new Schema<IProductBarcode>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    variantId: { type: Schema.Types.ObjectId },
    barcode: { type: String, required: true, trim: true },
    symbology: {
      type: String,
      enum: ['EAN13', 'UPC_A', 'CODE128', 'CODE39', 'QR', 'INTERNAL'],
      default: 'CODE128',
    },
    isPrimary: { type: Boolean, default: true },
    description: { type: String },
  },
  { timestamps: true }
);

// Unique barcode within the tenant
ProductBarcodeSchema.index({ tenantId: 1, barcode: 1 }, { unique: true });

export const ProductBarcode = mongoose.model<IProductBarcode>('ProductBarcode', ProductBarcodeSchema);

// -------------------------------------------------------------
// 5. PRODUCT MODEL
// -------------------------------------------------------------
export interface IProductImage {
  url: string;
  alt?: string;
  isPrimary?: boolean;
}

export interface IProduct extends Document {
  tenantId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  sku: string; // Unique primary SKU
  categoryId?: mongoose.Types.ObjectId;
  categoryName?: string;
  brand?: string;
  images: IProductImage[];
  
  // Pricing & Cost
  costPrice: number;
  sellingPrice: number;
  isTaxable: boolean;
  taxRatePercent: number;

  // Inventory & UOM
  unit: string; // e.g. 'PCS', 'BOX'
  reorderPoint: number;
  trackInventory: boolean;
  
  // Supplier Link
  primarySupplierId?: mongoose.Types.ObjectId;
  supplierProductCode?: string;

  // Variants
  hasVariants: boolean;
  variants: IProductVariant[];

  // Barcodes populated/cached
  barcodes?: IProductBarcode[];

  tags: string[];
  isArchived: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    name: { type: String, required: true, trim: true, index: true },
    description: { type: String },
    sku: { type: String, required: true, uppercase: true, trim: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'Category', index: true },
    categoryName: { type: String, trim: true, index: true },
    brand: { type: String, trim: true, index: true },
    images: [
      {
        url: { type: String, required: true },
        alt: String,
        isPrimary: { type: Boolean, default: false },
      },
    ],
    costPrice: { type: Number, default: 0, min: 0 },
    sellingPrice: { type: Number, required: true, min: 0 },
    isTaxable: { type: Boolean, default: true },
    taxRatePercent: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: 'PCS', uppercase: true },
    reorderPoint: { type: Number, default: 5, min: 0 },
    trackInventory: { type: Boolean, default: true },
    primarySupplierId: { type: Schema.Types.ObjectId, ref: 'Party' },
    supplierProductCode: { type: String, trim: true },
    hasVariants: { type: Boolean, default: false },
    variants: [ProductVariantSchema],
    tags: [{ type: String, trim: true }],
    isArchived: { type: Boolean, default: false, index: true },
    isActive: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

// Compound Unique Indexes
ProductSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ProductSchema.index({ tenantId: 1, isArchived: 1, isActive: 1, createdAt: -1 });
ProductSchema.index({ tenantId: 1, isArchived: 1, isActive: 1, name: 1 }); // POS active catalog sort
ProductSchema.index({ tenantId: 1, categoryName: 1 });
ProductSchema.index({ tenantId: 1, categoryId: 1 });
ProductSchema.index({ tenantId: 1, brand: 1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
