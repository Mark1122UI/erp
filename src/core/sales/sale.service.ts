import mongoose from 'mongoose';
import {
  Sale,
  ISale,
  SaleDocType,
  SaleStatus,
  PaymentMethod,
  ISalePayment,
  SalesReturn,
  ISalesReturn,
} from './sale.model.js';
import { Product } from '../catalog/product.model.js';
import { Party } from '../parties/party.model.js';
import { Tenant } from '../tenancy/tenant.model.js';
import { Location } from '../inventory/inventory.model.js';
import { inventoryService } from '../inventory/inventory.service.js';
import { Money } from '../common/money.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';
import { auditService } from '../audit/audit.service.js';

export interface CreateSaleItemDTO {
  productId: string;
  variantId?: string;
  quantity: number;
  unitPrice?: number; // Override or use catalog selling price
  discountAmount?: number;
  taxRatePercent?: number;
}

export interface CreateSalePaymentDTO {
  amount: number;
  paymentMethod: PaymentMethod;
  provider?: string;
  reference?: string;
  tenderedAmount?: number;
  changeAmount?: number;
  notes?: string;
}

export interface CreateSaleDTO {
  locationId?: string;
  customerId?: string;
  customerName?: string;
  docType?: SaleDocType;
  items: CreateSaleItemDTO[];
  payments?: CreateSalePaymentDTO[];
  clientReferenceId?: string;
  notes?: string;
}

export interface ProcessReturnItemDTO {
  productId: string;
  quantity: number;
}

export interface ProcessReturnDTO {
  originalSaleId: string;
  items: ProcessReturnItemDTO[];
  refundPaymentMethod?: PaymentMethod;
  reason?: string;
}

export interface ListSalesFilter {
  search?: string;
  status?: string;
  customerId?: string;
  locationId?: string;
  page?: number;
  limit?: number;
}

export interface ListSalesResult {
  sales: any[];
  pagination: {
    page: number;
    limit: number;
    totalRecords: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

export const saleService = {
  // -------------------------------------------------------------
  // 1. CREATE DIRECT SALE / INVOICE
  // -------------------------------------------------------------
  async createSale(tenantId: string, data: CreateSaleDTO, userId: string): Promise<ISale> {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestError('Sale must contain at least one product item');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const tenant = await Tenant.findById(tenantObjectId);
    if (!tenant) throw new NotFoundError('Tenant not found');

    // Resolve Location (Default to business main location if omitted)
    let locationId = data.locationId;
    if (!locationId || !mongoose.Types.ObjectId.isValid(locationId)) {
      const defaultLoc = await inventoryService.getOrCreateDefaultLocation(tenantId);
      locationId = defaultLoc.id;
    }
    const locObjectId = new mongoose.Types.ObjectId(locationId);

    // Resolve Customer if provided
    let customerName = data.customerName?.trim() || 'Walk-in Customer';
    let customerObjectId: mongoose.Types.ObjectId | undefined;

    if (data.customerId && mongoose.Types.ObjectId.isValid(data.customerId)) {
      const customer = await Party.findOne({
        _id: new mongoose.Types.ObjectId(data.customerId),
        tenantId: tenantObjectId,
      });
      if (customer) {
        customerObjectId = customer._id as mongoose.Types.ObjectId;
        customerName = customer.displayName;
      }
    }

    // Process Line Items with Safe Money Arithmetic
    let subtotalCents = 0;
    let discountTotalCents = 0;
    let taxTotalCents = 0;
    let grandTotalCents = 0;

    const processedItems = [];

    for (const rawItem of data.items) {
      if (!mongoose.Types.ObjectId.isValid(rawItem.productId)) {
        throw new BadRequestError(`Invalid product ID: ${rawItem.productId}`);
      }

      const prodObjectId = new mongoose.Types.ObjectId(rawItem.productId);
      const product = await Product.findOne({ _id: prodObjectId, tenantId: tenantObjectId });
      if (!product) {
        throw new NotFoundError(`Product not found: ${rawItem.productId}`);
      }

      const qty = Math.max(0.001, Number(rawItem.quantity) || 1);
      const unitPrice = rawItem.unitPrice !== undefined ? Number(rawItem.unitPrice) : product.sellingPrice;
      const costPrice = product.costPrice || 0;
      const discount = Math.max(0, Number(rawItem.discountAmount) || 0);
      const taxRate = rawItem.taxRatePercent !== undefined ? Number(rawItem.taxRatePercent) : (product.isTaxable ? product.taxRatePercent : 0);

      // Math
      const itemSubtotal = Money.multiply(unitPrice, qty);
      const itemTaxable = Math.max(0, Money.subtract(itemSubtotal, discount));
      const itemTax = Money.percentage(itemTaxable, taxRate);
      const lineTotal = Money.add(itemTaxable, itemTax);

      subtotalCents += Money.toCents(itemSubtotal);
      discountTotalCents += Money.toCents(discount);
      taxTotalCents += Money.toCents(itemTax);
      grandTotalCents += Money.toCents(lineTotal);

      processedItems.push({
        productId: prodObjectId,
        variantId: rawItem.variantId ? new mongoose.Types.ObjectId(rawItem.variantId) : undefined,
        name: product.name,
        sku: product.sku,
        quantity: qty,
        unitPrice,
        costPrice,
        discountAmount: discount,
        taxRatePercent: taxRate,
        taxAmount: itemTax,
        lineTotal,
      });
    }

    const subtotal = Money.fromCents(subtotalCents);
    const discountTotal = Money.fromCents(discountTotalCents);
    const taxTotal = Money.fromCents(taxTotalCents);
    const grandTotal = Money.fromCents(grandTotalCents);

    // Process Payments
    let paidAmountCents = 0;
    const processedPayments: ISalePayment[] = [];

    if (data.payments && data.payments.length > 0) {
      for (let i = 0; i < data.payments.length; i++) {
        const p = data.payments[i];
        const payAmount = Number(p.amount) || 0;
        if (payAmount > 0) {
          paidAmountCents += Money.toCents(payAmount);
          processedPayments.push({
            paymentNumber: `PAY-${Date.now()}-${i + 1}`,
            amount: payAmount,
            paymentMethod: p.paymentMethod || 'CASH',
            provider: p.provider || 'CASH_DRAWER',
            reference: p.reference,
            tenderedAmount: p.tenderedAmount,
            changeAmount: p.changeAmount,
            status: 'COMPLETED',
            notes: p.notes,
            createdAt: new Date(),
          });
        }
      }
    }

    const paidAmount = Money.fromCents(paidAmountCents);
    const dueAmount = Math.max(0, Money.subtract(grandTotal, paidAmount));

    // Determine Status
    let status: SaleStatus = 'CONFIRMED';
    if (paidAmount >= grandTotal) {
      status = 'PAID';
    } else if (paidAmount > 0) {
      status = 'PARTIALLY_PAID';
    }

    // Generate Unique Sequential Invoice / Sale / Quote Number
    const count = await Sale.countDocuments({ tenantId: tenantObjectId });
    const prefix = data.docType === 'QUOTE' ? 'QT' : data.docType === 'ORDER' ? 'ORD' : 'INV';
    let saleNumber = `${prefix}-${String(count + 1).padStart(5, '0')}`;
    let exists = await Sale.exists({ tenantId: tenantObjectId, saleNumber });
    let counter = count + 1;
    while (exists) {
      counter++;
      saleNumber = `${prefix}-${String(counter).padStart(5, '0')}`;
      exists = await Sale.exists({ tenantId: tenantObjectId, saleNumber });
    }

    // Create Sale Document
    const sale = await Sale.create({
      tenantId: tenantObjectId,
      locationId: locObjectId,
      customerId: customerObjectId,
      customerName,
      saleNumber,
      docType: data.docType || 'INVOICE',
      status,
      currency: tenant.currency || 'USD',
      subtotal,
      discountTotal,
      taxTotal,
      grandTotal,
      paidAmount,
      dueAmount,
      items: processedItems,
      payments: processedPayments,
      clientReferenceId: data.clientReferenceId,
      notes: data.notes,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // ---------------------------------------------------------
    // Automatic Inventory Deduction for Completed Sales (Quotes skip inventory)
    // ---------------------------------------------------------
    if (data.docType !== 'QUOTE') {
      for (const item of processedItems) {
        await inventoryService.recordStockMovement({
          tenantId,
          locationId: locationId!,
          productId: item.productId.toString(),
          variantId: item.variantId?.toString(),
          transactionType: 'SALE',
          quantityDelta: -item.quantity,
          referenceType: 'SALE_INVOICE',
          referenceId: sale.saleNumber,
          notes: `Sale to ${customerName}`,
          userId,
        });
      }

      // ---------------------------------------------------------
      // Update Customer Profile & Balance
      // ---------------------------------------------------------
      if (customerObjectId) {
        const customer = await Party.findOne({ _id: customerObjectId, tenantId: tenantObjectId });
        if (customer) {
          const details = customer.customerDetails || {
            currentBalance: 0,
            totalSpend: 0,
          };
          details.totalSpend = Money.add(details.totalSpend || 0, paidAmount);
          if (dueAmount > 0) {
            details.currentBalance = Money.add(details.currentBalance || 0, dueAmount);
          }
          customer.customerDetails = details as any;

          customer.transactions.push({
            transactionNumber: sale.saleNumber,
            type: 'INVOICE',
            amount: grandTotal,
            currency: tenant.currency || 'USD',
            status: status === 'PAID' ? 'PAID' : 'PENDING',
            reference: sale.saleNumber,
            description: `Sale of ${processedItems.length} items`,
            date: new Date(),
          } as any);

          await customer.save();
        }
      }
    }

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'Sale',
      entityId: sale.id,
      metadata: { saleNumber: sale.saleNumber, grandTotal: sale.grandTotal, status: sale.status },
    });

    return sale;
  },

  // -------------------------------------------------------------
  // 2. PROCESS SALES RETURN / REFUND
  // -------------------------------------------------------------
  async processSalesReturn(tenantId: string, data: ProcessReturnDTO, userId: string): Promise<ISalesReturn> {
    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    if (!mongoose.Types.ObjectId.isValid(data.originalSaleId)) {
      throw new BadRequestError('Invalid original sale ID');
    }

    const sale = await Sale.findOne({
      _id: new mongoose.Types.ObjectId(data.originalSaleId),
      tenantId: tenantObjectId,
    });
    if (!sale) throw new NotFoundError('Original sale not found');

    const processedReturnItems = [];
    let refundTotalCents = 0;

    for (const retItem of data.items) {
      const originalItem = sale.items.find(
        (it) => it.productId.toString() === retItem.productId
      );

      if (!originalItem) {
        throw new BadRequestError(`Product ${retItem.productId} was not part of the original sale`);
      }

      if (retItem.quantity > originalItem.quantity) {
        throw new BadRequestError(
          `Cannot return ${retItem.quantity} units of '${originalItem.name}'. Original purchased quantity: ${originalItem.quantity}`
        );
      }

      const itemRefundAmount = Money.multiply(originalItem.unitPrice, retItem.quantity);
      refundTotalCents += Money.toCents(itemRefundAmount);

      processedReturnItems.push({
        productId: originalItem.productId,
        name: originalItem.name,
        sku: originalItem.sku,
        quantity: retItem.quantity,
        unitPrice: originalItem.unitPrice,
        refundAmount: itemRefundAmount,
      });

      // ---------------------------------------------------------
      // Automatic Inventory Restoration (RETURN Transaction)
      // ---------------------------------------------------------
      await inventoryService.recordStockMovement({
        tenantId,
        locationId: sale.locationId.toString(),
        productId: originalItem.productId.toString(),
        transactionType: 'RETURN',
        quantityDelta: retItem.quantity,
        referenceType: 'SALE_RETURN',
        referenceId: sale.saleNumber,
        notes: `Returned from sale ${sale.saleNumber}. Reason: ${data.reason || 'Customer Return'}`,
        userId,
      });
    }

    const totalRefundAmount = Money.fromCents(refundTotalCents);

    const count = await SalesReturn.countDocuments({ tenantId: tenantObjectId });
    const returnNumber = `RET-${String(count + 1).padStart(5, '0')}`;

    const salesReturn = await SalesReturn.create({
      tenantId: tenantObjectId,
      locationId: sale.locationId,
      originalSaleId: sale._id,
      originalSaleNumber: sale.saleNumber,
      returnNumber,
      customerId: sale.customerId,
      customerName: sale.customerName,
      items: processedReturnItems,
      totalRefundAmount,
      refundPaymentMethod: data.refundPaymentMethod || 'CASH',
      reason: data.reason,
      createdBy: new mongoose.Types.ObjectId(userId),
    });

    // Update original sale status
    sale.status = 'REFUNDED';
    await sale.save();

    await auditService.log({
      tenantId,
      userId,
      action: 'CREATE',
      entity: 'SalesReturn',
      entityId: salesReturn.id,
      metadata: { returnNumber, originalSaleNumber: sale.saleNumber, totalRefundAmount },
    });

    return salesReturn;
  },

  // -------------------------------------------------------------
  // 3. GET PRINTABLE RECEIPT DATA
  // -------------------------------------------------------------
  async getReceiptData(tenantId: string, saleId: string) {
    if (!mongoose.Types.ObjectId.isValid(saleId)) {
      throw new BadRequestError('Invalid sale ID');
    }

    const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
    const [sale, tenant] = await Promise.all([
      Sale.findOne({ _id: new mongoose.Types.ObjectId(saleId), tenantId: tenantObjectId })
        .populate('locationId', 'name code address')
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Tenant.findById(tenantObjectId).lean(),
    ]);

    if (!sale || !tenant) throw new NotFoundError('Sale or Business profile not found');

    return {
      business: {
        name: tenant.name,
        address: tenant.address,
        currency: tenant.currency,
        phone: tenant.phone,
        taxId: tenant.settings?.taxNumber,
        receiptHeader: tenant.settings?.receiptHeader || 'Thank you for your business!',
        receiptFooter: tenant.settings?.receiptFooter || 'Please retain receipt for returns within 30 days.',
      },
      sale: {
        id: sale._id,
        saleNumber: sale.saleNumber,
        date: sale.createdAt,
        cashier: (sale.createdBy as any)?.firstName || 'Staff',
        customerName: sale.customerName,
        location: (sale.locationId as any)?.name || 'Main Store',
        items: sale.items,
        subtotal: sale.subtotal,
        discountTotal: sale.discountTotal,
        taxTotal: sale.taxTotal,
        grandTotal: sale.grandTotal,
        paidAmount: sale.paidAmount,
        dueAmount: sale.dueAmount,
        payments: sale.payments,
      },
    };
  },

  // -------------------------------------------------------------
  // 4. LIST & QUERY SALES
  // -------------------------------------------------------------
  async listSales(tenantId: string, filter: ListSalesFilter): Promise<ListSalesResult> {
    const page = Math.max(1, Number(filter.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filter.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
    };

    if (filter.status) query.status = filter.status;
    if (filter.locationId && mongoose.Types.ObjectId.isValid(filter.locationId)) {
      query.locationId = new mongoose.Types.ObjectId(filter.locationId);
    }
    if (filter.customerId && mongoose.Types.ObjectId.isValid(filter.customerId)) {
      query.customerId = new mongoose.Types.ObjectId(filter.customerId);
    }

    if (filter.search && filter.search.trim().length > 0) {
      const searchRegex = new RegExp(filter.search.trim(), 'i');
      query.$or = [{ saleNumber: searchRegex }, { customerName: searchRegex }];
    }

    const [sales, totalRecords] = await Promise.all([
      Sale.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('locationId', 'name code')
        .populate('createdBy', 'firstName lastName')
        .lean(),
      Sale.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      sales,
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
};
