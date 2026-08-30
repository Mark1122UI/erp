import mongoose from 'mongoose';
import {
  PurchaseOrder,
  IPurchaseOrder,
  PurchaseOrderStatus,
  GoodsReceipt,
  IGoodsReceipt,
  SupplierBill,
  ISupplierBill,
  SupplierBillStatus,
} from './purchase.model.js';
import { Product } from '../catalog/product.model.js';
import { Party } from '../parties/party.model.js';
import { Tenant } from '../tenancy/tenant.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { Money } from '../common/money.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';
import { PaymentMethod } from '../sales/sale.model.js';

export interface CreatePurchaseOrderItemDTO {
  productId: string;
  variantId?: string;
  orderedQuantity: number;
  unitCost?: number;
  taxRatePercent?: number;
}

export interface CreatePurchaseOrderDTO {
  supplierId: string;
  locationId?: string;
  items: CreatePurchaseOrderItemDTO[];
  orderDate?: Date;
  expectedDeliveryDate?: Date;
  notes?: string;
}

export interface ReceiveStockItemDTO {
  productId: string;
  quantityReceived: number;
  unitCost?: number;
}

export interface ReceiveStockDTO {
  purchaseOrderId?: string;
  supplierId?: string;
  locationId?: string;
  items: ReceiveStockItemDTO[];
  supplierInvoiceNumber?: string;
  notes?: string;
}

export interface RecordSupplierPaymentDTO {
  billId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  reference?: string;
  notes?: string;
}

export interface ListPurchaseOrdersFilter {
  supplierId?: string;
  status?: string;
  locationId?: string;
  search?: string;
  page?: number;
  limit?: number;
}

export const purchaseService = {
  // -------------------------------------------------------------
  // 1. CREATE PURCHASE ORDER (Does NOT increase stock yet)
  // -------------------------------------------------------------
  async createPurchaseOrder(
    tenantId: string,
    data: CreatePurchaseOrderDTO,
    userId: string
  ): Promise<IPurchaseOrder> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Purchase Order must contain at least one item');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    if (!mongoose.Types.ObjectId.isValid(data.supplierId)) {
      throw new BadRequestError('Invalid supplier ID');
    }
    const supplier = await Party.findOne({
      _id: new mongoose.Types.ObjectId(data.supplierId),
      tenantId: tenantObjectId,
    });
    if (!supplier) throw new NotFoundError('Supplier not found');

    let locationId = data.locationId;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      const defaultLoc = await inventoryService.getOrCreateDefaultLocation(tenantId);
      locationId = defaultLoc.id;
    }
    const locObjectId = new mongoose.Types.ObjectId(locationId);

    let subtotalCents = 0;
    let taxTotalCents = 0;
    let grandTotalCents = 0;

    const processedItems = [];

    for (const rawItem of data.items) {
      if (!mongoose.Types.ObjectId.isValid(rawItem.productId)) {
        throw new BadRequestError(`Invalid product ID: ${rawItem.productId}`);
      }
      const prodObjectId = new mongoose.Types.ObjectId(rawItem.productId);
      const product = await Product.findOne({ _id: prodObjectId, tenantId: tenantObjectId });
      if (!product) throw new NotFoundError(`Product not found: ${rawItem.productId}`);

      const qty = Math.max(0.001, Number(rawItem.orderedQuantity) || 1);
      const unitCost = rawItem.unitCost !== undefined ? Number(rawItem.unitCost) : product.costPrice;
      const taxRate = Number(rawItem.taxRatePercent) || 0;

      const itemSubtotal = Money.multiply(unitCost, qty);
      const itemTax = Money.percentage(itemSubtotal, taxRate);
      const lineTotal = Money.add(itemSubtotal, itemTax);

      subtotalCents += Money.toCents(itemSubtotal);
      taxTotalCents += Money.toCents(itemTax);
      grandTotalCents += Money.toCents(lineTotal);

      processedItems.push({
        productId: prodObjectId,
        variantId: rawItem.variantId ? new mongoose.Types.ObjectId(rawItem.variantId) : undefined,
        name: product.name,
        sku: product.sku,
        orderedQuantity: qty,
        receivedQuantity: 0,
        unitCost,
        taxRatePercent: taxRate,
        taxAmount: itemTax,
        lineTotal,
      });
    }

    const subtotal = Money.fromCents(subtotalCents);
    const taxTotal = Money.fromCents(taxTotalCents);
    const grandTotal = Money.fromCents(grandTotalCents);

    const count = await PurchaseOrder.countDocuments({ tenantId: tenantObjectId });
    const purchaseOrderNumber = `PO-${String(count + 1).padStart(5, '0')}`;

    const po = await PurchaseOrder.create({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      supplierId: supplier._id,
      supplierName: supplier.displayName,
      purchaseOrderNumber,
      status: 'ORDERED',
      currency: tenant.currency || 'USD',
      subtotal,
      taxTotal,
      grandTotal,
      items: processedItems,
      orderDate: data.orderDate || new Date(),
      expectedDeliveryDate: data.expectedDeliveryDate,
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'PurchaseOrder',
      entityId: po.id,
      metadata: { purchaseOrderNumber, grandTotal, supplier: supplier.displayName },
    });

    return po;
  },

  // -------------------------------------------------------------
  // 2. RECEIVE STOCK & CREATE INVENTORY TRANSACTIONS
  // -------------------------------------------------------------
  async receiveStock(
    tenantId: string,
    data: ReceiveStockDTO,
    userId: string
  ): Promise<{ goodsReceipt: IGoodsReceipt; bill: ISupplierBill }> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Must receive at least one item');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    let po: IPurchaseOrder | null = null;
    let supplierId = data.supplierId;
    let locationId = data.locationId;
    let supplierName = '';

    if (data.purchaseOrderId && mongoose.Types.ObjectId.isValid(data.purchaseOrderId)) {
      po = await PurchaseOrder.findOne({
        _id: new mongoose.Types.ObjectId(data.purchaseOrderId),
        tenantId: tenantObjectId,
      });
      if (!po) throw new NotFoundError('Purchase Order not found');

      supplierId = po.supplierId.toString();
      locationId = po.locationId.toString();
      supplierName = po.supplierName;
    }

    if (!supplierId || !mongoose.Types.ObjectId.isValid(supplierId)) {
      throw new BadRequestError('Supplier ID is required for goods receipt');
    }

    const supplier = await Party.findOne({
      _id: new mongoose.Types.ObjectId(supplierId),
      tenantId: tenantObjectId,
    });
    if (!supplier) throw new NotFoundError('Supplier not found');
    supplierName = supplier.displayName;

    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      const defaultLoc = await inventoryService.getOrCreateDefaultLocation(tenantId);
      locationId = defaultLoc.id;
    }

    let receiptTotalCents = 0;
    const grnItems = [];

    // Process Received Items & Increment Stock with PURCHASE Transaction
    for (const item of data.items) {
      const prodObjectId = new mongoose.Types.ObjectId(item.productId);
      const product = await Product.findOne({ _id: prodObjectId, tenantId: tenantObjectId });
      if (!product) throw new NotFoundError(`Product not found: ${item.productId}`);

      const qty = Math.max(0.001, Number(item.quantityReceived));
      const unitCost = item.unitCost !== undefined ? Number(item.unitCost) : product.costPrice;
      const lineCost = Money.multiply(unitCost, qty);
      receiptTotalCents += Money.toCents(lineCost);

      grnItems.push({
        productId: prodObjectId,
        name: product.name,
        sku: product.sku,
        quantityReceived: qty,
        unitCost,
      });

      // ---------------------------------------------------------
      // Increment Stock on Hand via PURCHASE Transaction
      // ---------------------------------------------------------
      await inventoryService.recordStockMovement({
        tenantId,
        locationId: locationId!,
        productId: item.productId,
        transactionType: 'PURCHASE',
        quantityDelta: qty,
        costPerUnit: unitCost,
        referenceType: 'PURCHASE_RECEIPT',
        referenceId: po ? po.purchaseOrderNumber : 'GRN-DIRECT',
        notes: `Received from ${supplierName}`,
        userId,
      });

      // Update PO received quantity if linked
      if (po) {
        const poItem = po.items.find((it) => it.productId.toString() === item.productId);
        if (poItem) {
          poItem.receivedQuantity = Number((poItem.receivedQuantity + qty).toFixed(3));
        }
      }
    }

    // Update PO Status
    if (po) {
      const allFullyReceived = po.items.every((it) => it.receivedQuantity >= it.orderedQuantity);
      po.status = allFullyReceived ? 'RECEIVED' : 'PARTIALLY_RECEIVED';
      await po.save();
    }

    // Generate Goods Receipt Record
    const grnCount = await GoodsReceipt.countDocuments({ tenantId: tenantObjectId });
    const receiptNumber = `GRN-${String(grnCount + 1).padStart(5, '0')}`;

    const goodsReceipt = await GoodsReceipt.create({
      tenantId: tenantObjectId,
      purchaseOrderId: po ? po._id : undefined,
      purchaseOrderNumber: po ? po.purchaseOrderNumber : undefined,
      receiptNumber,
      supplierId: supplier._id,
      supplierName,
      locationId: new mongoose.Types.ObjectId(locationId),
      items: grnItems,
      notes: data.notes,
      receivedAt: new Date(),
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // ---------------------------------------------------------
    // Generate Supplier Bill & Update Supplier Accounts Payable
    // ---------------------------------------------------------
    const totalBillAmount = Money.fromCents(receiptTotalCents);
    const billCount = await SupplierBill.countDocuments({ tenantId: tenantObjectId });
    const billNumber = `BILL-${String(billCount + 1).padStart(5, '0')}`;

    const bill = await SupplierBill.create({
      tenantId: tenantObjectId,
      purchaseOrderId: po ? po._id : undefined,
      purchaseOrderNumber: po ? po.purchaseOrderNumber : undefined,
      supplierId: supplier._id,
      supplierName,
      billNumber,
      supplierInvoiceNumber: data.supplierInvoiceNumber,
      status: 'UNPAID',
      currency: tenant.currency || 'USD',
      totalAmount: totalBillAmount,
      paidAmount: 0,
      dueAmount: totalBillAmount,
      billDate: new Date(),
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // Update Supplier Balance on Party
    const suppDetails = supplier.supplierDetails || {
      currentBalance: 0,
      totalPurchased: 0,
    };
    suppDetails.currentBalance = Money.add(suppDetails.currentBalance || 0, totalBillAmount);
    suppDetails.totalPurchased = Money.add(suppDetails.totalPurchased || 0, totalBillAmount);
    supplier.supplierDetails = suppDetails as any;

    supplier.transactions.push({
      transactionNumber: bill.billNumber,
      type: 'BILL',
      amount: totalBillAmount,
      currency: tenant.currency || 'USD',
      status: 'PENDING',
      reference: receiptNumber,
      description: `Goods receipt of ${grnItems.length} items`,
      date: new Date(),
    } as any);

    await supplier.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'GoodsReceipt',
      entityId: goodsReceipt.id,
      metadata: { receiptNumber, billNumber, totalBillAmount },
    });

    return { goodsReceipt, bill };
  },

  // -------------------------------------------------------------
  // 3. RECORD SUPPLIER PAYMENT
  // -------------------------------------------------------------
  async recordSupplierPayment(
    tenantId: string,
    data: RecordSupplierPaymentDTO,
    userId: string
  ): Promise<ISupplierBill> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    if (!mongoose.Types.ObjectId.isValid(data.billId)) {
      throw new BadRequestError('Invalid bill ID');
    }

    const bill = await SupplierBill.findOne({
      _id: new mongoose.Types.ObjectId(data.billId),
      tenantId: tenantObjectId,
    });
    if (!bill) throw new NotFoundError('Supplier bill not found');

    const paymentAmount = Number(data.amount);
    if (isNaN(paymentAmount) || paymentAmount <= 0) {
      throw new BadRequestError('Payment amount must be greater than 0');
    }

    if (paymentAmount > bill.dueAmount) {
      throw new BadRequestError(
        `Payment amount (${paymentAmount}) exceeds remaining due amount (${bill.dueAmount})`
      );
    }

    const newPaidAmount = Money.add(bill.paidAmount, paymentAmount);
    const newDueAmount = Math.max(0, Money.subtract(bill.totalAmount, newPaidAmount));

    const count = bill.payments.length;
    const paymentNumber = `SPAY-${Date.now()}-${count + 1}`;

    bill.payments.push({
      paymentNumber,
      amount: paymentAmount,
      paymentMethod: data.paymentMethod,
      reference: data.reference,
      notes: data.notes,
      paidAt: new Date(),
      createdBy: new mongoose.Types.ObjectId(userId),
    } as any);

    bill.paidAmount = newPaidAmount;
    bill.dueAmount = newDueAmount;
    bill.status = newDueAmount === 0 ? 'PAID' : 'PARTIALLY_PAID';
    await bill.save();

    // Reduce Supplier Account Payable Balance on Party
    const supplier = await Party.findOne({ _id: bill.supplierId, tenantId: tenantObjectId });
    if (supplier) {
      const suppDetails = supplier.supplierDetails || {
        currentBalance: 0,
        totalPurchased: 0,
      };
      suppDetails.currentBalance = Math.max(
        0,
        Money.subtract(suppDetails.currentBalance || 0, paymentAmount)
      );
      supplier.supplierDetails = suppDetails as any;

      supplier.transactions.push({
        transactionNumber: paymentNumber,
        type: 'PAYMENT',
        amount: paymentAmount,
        currency: bill.currency,
        status: 'PAID',
        reference: bill.billNumber,
        description: `Payment for bill ${bill.billNumber}`,
        date: new Date(),
      } as any);

      await supplier.save();
    }

    await auditService.log({
      tenantId,
      userId,
      action: 'UPDATE',
      entity: 'SupplierBill',
      entityId: bill.id,
      metadata: { billNumber: bill.billNumber, paymentAmount, remainingDue: newDueAmount },
    });

    return bill;
  },

  // -------------------------------------------------------------
  // 4. QUERIES
  // -------------------------------------------------------------
  async listPurchaseOrders(tenantId: string, filter: ListPurchaseOrdersFilter) {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (filter.status) query.status = filter.status;
    if (filter.supplierId && mongoose.Types.ObjectId.isValid(filter.supplierId)) {
      query.supplierId = new mongoose.Types.ObjectId(filter.supplierId);
    }
    if (filter.locationId && mongoose.Types.ObjectId.isValid(filter.locationId)) {
      query.locationId = new mongoose.Types.ObjectId(filter.locationId);
    }
    if (filter.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [{ purchaseOrderNumber: searchRegex }, { supplierName: searchRegex }];
    }

    const [orders, totalRecords] = await Promise.all([
      PurchaseOrder.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('locationId', 'name code')
        .populate('supplierId', 'displayName email phone')
        .populate('createdBy', 'firstName lastName')
        .lean(),
      PurchaseOrder.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      orders,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },

  async listSupplierBills(tenantId: string, supplierId?: string) {
    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };
    if (supplierId && mongoose.Types.ObjectId.isValid(supplierId)) {
      query.supplierId = new mongoose.Types.ObjectId(supplierId);
    }

    return await SupplierBill.find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .populate('supplierId', 'displayName email')
      .populate('createdBy', 'firstName lastName')
      .lean();
  },
};
