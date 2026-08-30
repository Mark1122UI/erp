import { Router } from 'express';
import { z } from 'zod';
import { purchaseService } from './purchase.service.js';
import { PurchaseOrder, GoodsReceipt, SupplierBill } from './purchase.model.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import mongoose from 'mongoose';

const router = Router();

// Validation Schemas
const poItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  orderedQuantity: z.number().min(0.001, 'Quantity must be positive'),
  unitCost: z.number().nonnegative().optional(),
  taxRatePercent: z.number().nonnegative().optional(),
});

const createPurchaseOrderSchema = z.object({
  supplierId: z.string().min(1, 'Supplier ID is required'),
  locationId: z.string().optional(),
  items: z.array(poItemSchema).min(1, 'At least one item is required'),
  orderDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  expectedDeliveryDate: z.string().optional().transform((val) => (val ? new Date(val) : undefined)),
  notes: z.string().optional(),
});

const receiveStockSchema = z.object({
  purchaseOrderId: z.string().optional(),
  supplierId: z.string().optional(),
  locationId: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantityReceived: z.number().min(0.001, 'Quantity received must be positive'),
      unitCost: z.number().nonnegative().optional(),
    })
  ).min(1, 'At least one item must be received'),
  supplierInvoiceNumber: z.string().optional(),
  notes: z.string().optional(),
});

const supplierPaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER']),
  reference: z.string().optional(),
  notes: z.string().optional(),
});

// -------------------------------------------------------------
// 1. PURCHASE ORDERS
// -------------------------------------------------------------
router.get(
  '/orders',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { supplierId, status, locationId, search, page, limit } = req.query;

      const result = await purchaseService.listPurchaseOrders(tenantId, {
        supplierId: supplierId as string,
        status: status as string,
        locationId: locationId as string,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.orders, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/orders',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_CREATE),
  validateRequest({ body: createPurchaseOrderSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const po = await purchaseService.createPurchaseOrder(tenantId, req.body, userId);
      sendSuccess(res, po, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/orders/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const po = await PurchaseOrder.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .populate('locationId', 'name code')
        .populate('supplierId', 'displayName email phone')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      if (!po) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Purchase order not found' } });
        return;
      }

      sendSuccess(res, po);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. RECEIVE STOCK & LOG INVENTORY MOVEMENT
// -------------------------------------------------------------
router.post(
  '/receive',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_CREATE),
  validateRequest({ body: receiveStockSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await purchaseService.receiveStock(tenantId, req.body, userId);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. SUPPLIER BILLS & PAYMENTS
// -------------------------------------------------------------
router.get(
  '/bills',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const bills = await purchaseService.listSupplierBills(tenantId, req.query.supplierId as string);
      sendSuccess(res, bills);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/bills/:id/pay',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_CREATE),
  validateRequest({ body: supplierPaymentSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const bill = await purchaseService.recordSupplierPayment(
        tenantId,
        { billId: req.params.id, ...req.body },
        userId
      );
      sendSuccess(res, bill);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/receipts',
  requireAuth,
  requirePermission(PERMISSIONS.PURCHASES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const receipts = await GoodsReceipt.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('locationId', 'name code')
        .populate('supplierId', 'displayName email')
        .populate('createdBy', 'firstName lastName')
        .lean();

      sendSuccess(res, receipts);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
