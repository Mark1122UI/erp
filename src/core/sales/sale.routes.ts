import { Router } from 'express';
import { z } from 'zod';
import { saleService } from './sale.service.js';
import { Sale, SalesReturn } from './sale.model.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import mongoose from 'mongoose';

const router = Router();

// Validation Schemas
const saleItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z.number().min(0.001, 'Quantity must be positive'),
  unitPrice: z.number().nonnegative().optional(),
  discountAmount: z.number().nonnegative().optional(),
  taxRatePercent: z.number().nonnegative().optional(),
});

const salePaymentSchema = z.object({
  amount: z.number().positive('Payment amount must be greater than zero'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER']),
  provider: z.string().optional(),
  reference: z.string().optional(),
  tenderedAmount: z.number().optional(),
  changeAmount: z.number().optional(),
  notes: z.string().optional(),
});

const createSaleSchema = z.object({
  locationId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  docType: z.enum(['QUOTE', 'ORDER', 'INVOICE', 'RETURN']).optional(),
  items: z.array(saleItemSchema).min(1, 'At least one line item is required'),
  payments: z.array(salePaymentSchema).optional(),
  notes: z.string().optional(),
});

const processReturnSchema = z.object({
  originalSaleId: z.string().min(1, 'Original sale ID is required'),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one return item is required'),
  refundPaymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER']).optional(),
  reason: z.string().optional(),
});

// -------------------------------------------------------------
// 1. LIST & QUERY SALES
// -------------------------------------------------------------
router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { search, status, customerId, locationId, page, limit } = req.query;

      const result = await saleService.listSales(tenantId, {
        search: search as string,
        status: status as string,
        customerId: customerId as string,
        locationId: locationId as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.sales, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. CREATE SALE / INVOICE
// -------------------------------------------------------------
router.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_CREATE),
  validateRequest({ body: createSaleSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const sale = await saleService.createSale(tenantId, req.body, userId);
      sendSuccess(res, sale, 201);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. GET SALE DETAILS
// -------------------------------------------------------------
router.get(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const sale = await Sale.findOne({
        _id: new mongoose.Types.ObjectId(req.params.id),
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .populate('locationId', 'name code')
        .populate('customerId', 'displayName email phone')
        .populate('createdBy', 'firstName lastName email')
        .lean();

      if (!sale) {
        res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Sale not found' } });
        return;
      }

      sendSuccess(res, sale);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 4. PRINTABLE RECEIPT DATA
// -------------------------------------------------------------
router.get(
  '/:id/receipt',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const receipt = await saleService.getReceiptData(tenantId, req.params.id);
      sendSuccess(res, receipt);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 5. PROCESS SALES RETURN / REFUND
// -------------------------------------------------------------
router.post(
  '/returns',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_REFUND),
  validateRequest({ body: processReturnSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const salesReturn = await saleService.processSalesReturn(tenantId, req.body, userId);
      sendSuccess(res, salesReturn, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/returns/list',
  requireAuth,
  requirePermission(PERMISSIONS.SALES_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const returns = await SalesReturn.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('locationId', 'name code')
        .populate('createdBy', 'firstName lastName')
        .lean();

      sendSuccess(res, returns);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
