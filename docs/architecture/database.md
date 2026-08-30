# Universal ERP / Business Operating System — Database Architecture

## 1. Database Engine & Selection Rationale

The primary database for the platform is **MongoDB (v6.0+ / v7.0+)**.
- **No SQLite**: SQLite lacks native multi-tenant sharding, distributed transactions, and fine-grained cluster high availability.
- **No Prisma**: Prisma adds abstraction overhead on complex polymorphic schemas and advanced aggregation pipelines. Mongoose ODM and native MongoDB Node.js driver provide native support for document discriminators, transactional sessions, dynamic indexes, and change streams.

---

## 2. Multi-Tenancy & Indexing Strategy

### 2.1 Universal Tenant Partitioning
Every collection across the database is partitioned logically using a mandatory `tenantId` field of type `ObjectId`.

### 2.2 Indexing Best Practices
1. **Prefix Index Pattern**: All primary lookup indexes MUST be compound indexes starting with `tenantId`:
   - `{ tenantId: 1, sku: 1 }` (unique within tenant)
   - `{ tenantId: 1, barcode: 1 }` (sparse index for fast scanner lookups)
   - `{ tenantId: 1, status: 1, createdAt: -1 }` (filtered list views)
2. **Text & Search Indexes**: Tenant-aware compound text indexes on item names, barcodes, customer phone numbers, and invoice numbers.

---

## 3. Core Schemas & Entity Relationship Overview

```
                      +-------------------+
                      |      Tenant       |
                      +-------------------+
                                │ 1:N
                      +-------------------+
                      |   Organization    |
                      +-------------------+
                                │ 1:N
                      +-------------------+
                      |  Branch/Warehouse |
                      +-------------------+
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
+---------------+       +---------------+       +---------------+
|     Party     |       |     Item      |       |  StockLevel   |
|  (CRM / Base) |       | (Base Catalog)|       |  (Per Branch) |
+---------------+       +---------------+       +---------------+
        │                       │                       │
        ▼                       ▼                       ▼
+---------------+       +---------------+       +---------------+
| JournalEntry  |       | StockMovement |       |  RetailSale / |
| (Ledger / Fin)|       | (Audit Trail) |       | EcomOrder     |
+---------------+       +---------------+       +---------------+
```

---

## 4. Detailed Data Schemas (Mongoose / MongoDB)

### 4.1 Tenancy & Organization Hierarchy

```typescript
// Tenant Schema
const TenantSchema = new Schema({
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true, index: true },
  plan: { type: String, enum: ['STARTER', 'GROWTH', 'ENTERPRISE'], default: 'STARTER' },
  activeModules: [{ type: String }], // ['core', 'retail', 'ecommerce', 'manufacturing']
  settings: {
    baseCurrency: { type: String, default: 'USD' },
    fiscalYearStartMonth: { type: Number, default: 1 },
    timeZone: { type: String, default: 'UTC' }
  },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });

// Organization (Legal Entity) Schema
const OrganizationSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  legalName: { type: String, required: true },
  tradeName: { type: String },
  taxId: { type: String },
  registrationNumber: { type: String },
  registeredAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  currency: { type: String, required: true }
}, { timestamps: true });

// Branch / Warehouse Schema
const BranchSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['STORE', 'WAREHOUSE', 'HEAD_OFFICE', 'HYBRID'], default: 'STORE' },
  address: { street: String, city: String, state: String, postalCode: String, country: String },
  isFulfillmentNode: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
BranchSchema.index({ tenantId: 1, code: 1 }, { unique: true });
```

---

### 4.2 Security & Identity Schemas

```typescript
// User Schema
const UserSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  passwordHash: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  pin: { type: String }, // Hashed 4-6 digit PIN for fast POS terminal unlock
  roles: [{ type: Schema.Types.ObjectId, ref: 'Role' }],
  assignedBranches: [{ type: Schema.Types.ObjectId, ref: 'Branch' }],
  defaultBranchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  mfaSecret: { type: String },
  isMfaEnabled: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  lastLoginAt: { type: Date }
}, { timestamps: true });
UserSchema.index({ tenantId: 1, email: 1 }, { unique: true });

// Role & Permissions Schema (RBAC / ABAC)
const RoleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true }, // e.g. 'Store Manager', 'Cashier', 'Accountant'
  isSystemRole: { type: Boolean, default: false },
  permissions: [{
    resource: { type: String, required: true }, // e.g., 'inventory', 'sales', 'pos_register', 'general_ledger'
    actions: [{ type: String, enum: ['create', 'read', 'update', 'delete', 'approve', 'export'] }],
    conditions: { type: Schema.Types.Mixed } // Attribute-based access condition, e.g. { maxDiscountPercent: 15 }
  }]
}, { timestamps: true });
```

---

### 4.3 Universal Financials & Double-Entry Ledger Schemas

```typescript
// Chart of Accounts Schema
const AccountSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  code: { type: String, required: true }, // e.g., '1010' Cash, '4010' Sales Revenue, '5010' COGS
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'], 
    required: true 
  },
  subType: { type: String }, // e.g. 'CURRENT_ASSET', 'OPERATING_EXPENSE'
  currency: { type: String, required: true },
  parentAccountId: { type: Schema.Types.ObjectId, ref: 'Account' },
  isReconciled: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
AccountSchema.index({ tenantId: 1, code: 1 }, { unique: true });

// Journal Entry Schema (Double-Entry Invariant: Sum(Debits) == Sum(Credits))
const JournalEntrySchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
  entryNumber: { type: String, required: true }, // e.g. 'JE-2026-000192'
  postingDate: { type: Date, required: true, index: true },
  referenceType: { 
    type: String, 
    enum: ['POS_SALE', 'SALES_INVOICE', 'PURCHASE_RECEIPT', 'PAYMENT', 'INVENTORY_ADJUSTMENT', 'MANUAL'],
    required: true 
  },
  referenceId: { type: Schema.Types.ObjectId },
  lines: [{
    accountId: { type: Schema.Types.ObjectId, ref: 'Account', required: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party' },
    description: { type: String },
    debit: { type: Number, default: 0, min: 0 },
    credit: { type: Number, default: 0, min: 0 },
    currency: { type: String, required: true },
    exchangeRate: { type: Number, default: 1 }
  }],
  totalDebit: { type: Number, required: true },
  totalCredit: { type: Number, required: true },
  status: { type: String, enum: ['DRAFT', 'POSTED', 'VOIDED'], default: 'POSTED' },
  postedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
JournalEntrySchema.index({ tenantId: 1, entryNumber: 1 }, { unique: true });
```

---

### 4.4 Universal Inventory & Catalog Schemas

```typescript
// Universal Item (Catalog Master) Schema
const ItemSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  sku: { type: String, required: true },
  name: { type: String, required: true },
  description: { type: String },
  type: { 
    type: String, 
    enum: ['GOODS', 'SERVICE', 'COMPOSITE_KIT', 'DIGITAL'], 
    default: 'GOODS' 
  },
  category: { type: String, index: true },
  brand: { type: String, index: true },
  unitOfMeasure: { type: String, default: 'PCS' }, // Standard UOM
  
  // Barcode Identifiers
  barcodes: [{
    barcode: { type: String, required: true },
    symbology: { type: String, enum: ['EAN13', 'UPC_A', 'CODE128', 'QR'], default: 'EAN13' },
    isPrimary: { type: Boolean, default: true }
  }],
  
  // Costing & Valuation (Universal)
  costingMethod: { type: String, enum: ['FIFO', 'WEIGHTED_AVERAGE', 'STANDARD'], default: 'WEIGHTED_AVERAGE' },
  standardCost: { type: Number, default: 0 },
  basePrice: { type: Number, required: true },
  taxRatePercent: { type: Number, default: 0 },

  // Tracking Capabilities
  isBatchTracked: { type: Boolean, default: false },
  isSerialTracked: { type: Boolean, default: false },
  hasExpiry: { type: Boolean, default: false },

  // Matrix Variant Definitions (Retail Extension)
  isVariantParent: { type: Boolean, default: false },
  parentItemId: { type: Schema.Types.ObjectId, ref: 'Item' },
  variantAttributes: {
    color: String,
    size: String,
    style: String,
    material: String
  },

  // Dynamic Industry Extension Payload (EAV / Flexible schema)
  industryExtensions: {
    retail: {
      isPosVisible: { type: Boolean, default: true },
      isEcommerceVisible: { type: Boolean, default: true },
      reorderPoint: { type: Number, default: 10 },
      tags: [String],
      images: [{ url: String, alt: String, isPrimary: Boolean }]
    },
    healthcare: { type: Schema.Types.Mixed },
    manufacturing: { type: Schema.Types.Mixed }
  },

  isActive: { type: Boolean, default: true }
}, { timestamps: true });
ItemSchema.index({ tenantId: 1, sku: 1 }, { unique: true });
ItemSchema.index({ tenantId: 1, 'barcodes.barcode': 1 });

// Stock Level Schema (Per Location Stock Balances)
const StockLevelSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  quantityOnHand: { type: Number, default: 0 },
  quantityReserved: { type: Number, default: 0 }, // Reserved for pending web orders
  quantityAvailable: { type: Number, default: 0 }, // onHand - reserved
  averageCost: { type: Number, default: 0 },
  binLocation: { type: String } // e.g., 'Aisle 3, Shelf B'
}, { timestamps: true });
StockLevelSchema.index({ tenantId: 1, branchId: 1, itemId: 1 }, { unique: true });

// Stock Movement Audit Schema
const StockMovementSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true, index: true },
  movementType: { 
    type: String, 
    enum: ['POS_SALE', 'ONLINE_SALE', 'PURCHASE_RECEIPT', 'TRANSFER_IN', 'TRANSFER_OUT', 'ADJUSTMENT', 'RETURN'],
    required: true 
  },
  quantityDelta: { type: Number, required: true }, // negative for sales, positive for receipts
  balanceAfter: { type: Number, required: true },
  unitCost: { type: Number, required: true },
  referenceId: { type: Schema.Types.ObjectId },
  batchNumber: { type: String },
  serialNumbers: [String],
  executedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });
```

---

### 4.5 Retail & E-Commerce Specialized Schemas

```typescript
// POS Cash Register & Shift Session Schema
const PosShiftSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  registerId: { type: String, required: true }, // e.g. 'REG-01'
  cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  openingCash: { type: Number, required: true },
  closingCashExpected: { type: Number },
  closingCashActual: { type: Number },
  cashDifference: { type: Number },
  startedAt: { type: Date, default: Date.now },
  closedAt: { type: Date },
  status: { type: String, enum: ['OPEN', 'CLOSED', 'SUSPENDED'], default: 'OPEN' },
  summary: {
    totalSales: { type: Number, default: 0 },
    cashSales: { type: Number, default: 0 },
    cardSales: { type: Number, default: 0 },
    qrPayments: { type: Number, default: 0 },
    refundCount: { type: Number, default: 0 },
    totalRefunds: { type: Number, default: 0 }
  }
}, { timestamps: true });

// Retail POS Sale & Omnichannel Order Schema
const RetailSaleSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true, index: true },
  posShiftId: { type: Schema.Types.ObjectId, ref: 'PosShift' },
  orderNumber: { type: String, required: true }, // e.g. 'POS-20260824-0042'
  channel: { type: String, enum: ['POS', 'ECOMMERCE_WEB', 'SHOPIFY_SYNC', 'MOBILE_APP'], default: 'POS' },
  
  customerId: { type: Schema.Types.ObjectId, ref: 'Party' },
  cashierId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  
  items: [{
    itemId: { type: Schema.Types.ObjectId, ref: 'Item', required: true },
    sku: { type: String, required: true },
    name: { type: String, required: true },
    unitPrice: { type: Number, required: true },
    quantity: { type: Number, required: true },
    discountAmount: { type: Number, default: 0 },
    taxAmount: { type: Number, default: 0 },
    totalLineAmount: { type: Number, required: true }
  }],

  subtotal: { type: Number, required: true },
  discountTotal: { type: Number, default: 0 },
  taxTotal: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },

  payments: [{
    paymentMethod: { type: String, enum: ['CASH', 'CARD_STRIPE', 'QR_CODE', 'STORE_CREDIT', 'SPLIT'], required: true },
    amount: { type: Number, required: true },
    transactionRef: { type: String },
    status: { type: String, enum: ['PAID', 'PENDING', 'FAILED'], default: 'PAID' }
  }],

  idempotencyKey: { type: String, unique: true, sparse: true }, // POS offline sync idempotency UUID
  fulfillmentStatus: { type: String, enum: ['FULFILLED', 'PENDING_PICKUP', 'SHIPPED', 'DELIVERED'], default: 'FULFILLED' },
  paymentStatus: { type: String, enum: ['PAID', 'PARTIALLY_PAID', 'REFUNDED'], default: 'PAID' }
}, { timestamps: true });
RetailSaleSchema.index({ tenantId: 1, orderNumber: 1 }, { unique: true });
RetailSaleSchema.index({ tenantId: 1, channel: 1, createdAt: -1 });

// Pricing & Promotion Engine Schema
const PromotionSchema = new Schema({
  tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
  name: { type: String, required: true },
  couponCode: { type: String, sparse: true },
  discountType: { type: String, enum: ['PERCENTAGE', 'FIXED_AMOUNT', 'BOGO', 'TIERED_QTY'], required: true },
  discountValue: { type: Number, required: true },
  minCartTotal: { type: Number, default: 0 },
  eligibleItemIds: [{ type: Schema.Types.ObjectId, ref: 'Item' }],
  eligibleCategories: [String],
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  usageLimitPerCustomer: { type: Number, default: 1 },
  totalUsageLimit: { type: Number },
  currentUsageCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
```

---

## 5. ACID Transaction Management

For financial postings, POS checkout, and stock reconciliation, operations are wrapped in MongoDB Multi-Document Transactions:

```typescript
import mongoose from 'mongoose';

export async function processSaleWithLedgerAndStock(saleData: any, tenantId: string) {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // 1. Create Sale Record
    const sale = new RetailSale({ ...saleData, tenantId });
    await sale.save({ session });

    // 2. Deduct Stock Levels & Record Stock Movements
    for (const line of saleData.items) {
      const stock = await StockLevel.findOneAndUpdate(
        { tenantId, branchId: saleData.branchId, itemId: line.itemId, quantityAvailable: { $gte: line.quantity } },
        { $inc: { quantityOnHand: -line.quantity, quantityAvailable: -line.quantity } },
        { session, new: true }
      );
      if (!stock) {
        throw new Error(`Insufficient inventory for SKU: ${line.sku}`);
      }

      await StockMovement.create([{
        tenantId,
        branchId: saleData.branchId,
        itemId: line.itemId,
        movementType: 'POS_SALE',
        quantityDelta: -line.quantity,
        balanceAfter: stock.quantityOnHand,
        unitCost: stock.averageCost,
        referenceId: sale._id,
        executedBy: saleData.cashierId
      }], { session });
    }

    // 3. Post Double-Entry Journal Entry
    await JournalEntry.create([{
      tenantId,
      organizationId: saleData.organizationId,
      branchId: saleData.branchId,
      entryNumber: `JE-${Date.now()}`,
      postingDate: new Date(),
      referenceType: 'POS_SALE',
      referenceId: sale._id,
      lines: [
        { accountId: saleData.cashAccountId, debit: sale.grandTotal, credit: 0, currency: 'USD' },
        { accountId: saleData.revenueAccountId, debit: 0, credit: sale.subtotal, currency: 'USD' },
        { accountId: saleData.taxPayableAccountId, debit: 0, credit: sale.taxTotal, currency: 'USD' }
      ],
      totalDebit: sale.grandTotal,
      totalCredit: sale.grandTotal,
      postedBy: saleData.cashierId
    }], { session });

    await session.commitTransaction();
    return sale;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
}
```
