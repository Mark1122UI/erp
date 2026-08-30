import { Router } from 'express';
import { z } from 'zod';
import { inventoryService } from './inventory.service.js';
import { StockAdjustment, StockTransfer } from './inventory.model.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import mongoose from 'mongoose';

const router = Router();

// Validation Schemas
const locationBodySchema = z.object({
  name: z.string().min(1, 'Location name is required'),
  code: z.string().min(1, 'Location code is required'),
  type: z.enum(['STORE', 'WAREHOUSE', 'BRANCH', 'OTHER']).optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      zipCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  isDefault: z.boolean().optional(),
});

const stockMovementSchema = z.object({
  locationId: z.string().min(1, 'Location ID is required'),
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  transactionType: z.enum([
    'OPENING_BALANCE',
    'PURCHASE',
    'SALE',
    'RETURN',
    'TRANSFER_IN',
    'TRANSFER_OUT',
    'ADJUSTMENT',
    'DAMAGE',
  ]),
  quantityDelta: z.number(),
  costPerUnit: z.number().nonnegative().optional(),
  referenceType: z.string().optional(),
  referenceId: z.string().optional(),
  notes: z.string().optional(),
});

const stockAdjustmentSchema = z.object({
  locationId: z.string().min(1, 'Location ID is required'),
  reason: z.enum([
    'PHYSICAL_COUNT',
    'DAMAGED_EXPIRED',
    'FOUND_STOCK',
    'THEFT_LOSS',
    'INTERNAL_USE',
    'CORRECTION',
  ]),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      newQuantity: z.number().optional(),
      deltaQuantity: z.number().optional(),
      unitCost: z.number().optional(),
    })
  ).min(1, 'At least one item is required in the adjustment'),
});

const stockTransferSchema = z.object({
  sourceLocationId: z.string().min(1, 'Source location is required'),
  destinationLocationId: z.string().min(1, 'Destination location is required'),
  notes: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string().optional(),
      quantity: z.number().min(1, 'Quantity must be at least 1'),
    })
  ).min(1, 'At least one item is required in the transfer'),
});

// -------------------------------------------------------------
// 1. LOCATIONS ENDPOINTS
// -------------------------------------------------------------
router.get(
  '/locations',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const locations = await inventoryService.listLocations(tenantId);
      sendSuccess(res, locations);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/locations',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  validateRequest({ body: locationBodySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const location = await inventoryService.createLocation(tenantId, req.body, userId);
      sendSuccess(res, location, 201);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. STOCK LEVELS & VALUATION
// -------------------------------------------------------------
router.get(
  '/stock',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { locationId, search, isLowStock, page, limit } = req.query;

      const result = await inventoryService.getStockLevels(tenantId, {
        locationId: locationId as string,
        search: search as string,
        isLowStock: isLowStock === 'true',
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.items, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. RECORD TRANSACTION-BASED STOCK MOVEMENT
// -------------------------------------------------------------
router.post(
  '/movements',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  validateRequest({ body: stockMovementSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const movement = await inventoryService.recordStockMovement({
        ...req.body,
        tenantId,
        userId,
      });
      sendSuccess(res, movement, 201);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 4. STOCK ADJUSTMENTS
// -------------------------------------------------------------
router.post(
  '/adjustments',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  validateRequest({ body: stockAdjustmentSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const adjustment = await inventoryService.createStockAdjustment(tenantId, req.body, userId);
      sendSuccess(res, adjustment, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/adjustments',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const adjustments = await StockAdjustment.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('locationId', 'name code')
        .populate('items.productId', 'name sku unit')
        .populate('createdBy', 'firstName lastName')
        .lean();

      sendSuccess(res, adjustments);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 5. STOCK TRANSFERS
// -------------------------------------------------------------
router.post(
  '/transfers',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  validateRequest({ body: stockTransferSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const transfer = await inventoryService.createStockTransfer(tenantId, req.body, userId);
      sendSuccess(res, transfer, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/transfers/:id/dispatch',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const transfer = await inventoryService.dispatchTransfer(tenantId, req.params.id, userId);
      sendSuccess(res, transfer);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/transfers/:id/receive',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const transfer = await inventoryService.receiveTransfer(tenantId, req.params.id, userId);
      sendSuccess(res, transfer);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/transfers',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const transfers = await StockTransfer.find({
        tenantId: new mongoose.Types.ObjectId(tenantId),
      })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('sourceLocationId', 'name code')
        .populate('destinationLocationId', 'name code')
        .populate('items.productId', 'name sku unit')
        .populate('createdBy', 'firstName lastName')
        .lean();

      sendSuccess(res, transfers);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 6. INVENTORY TRANSACTION AUDIT LEDGER
// -------------------------------------------------------------
router.get(
  '/transactions',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { locationId, productId, limit } = req.query;
      const history = await inventoryService.getTransactionHistory(tenantId, {
        locationId: locationId as string,
        productId: productId as string,
        limit: limit ? Number(limit) : 50,
      });
      sendSuccess(res, history);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 7. BARCODE-DRIVEN STOCK COUNT (PHYSICAL INVENTORY AUDITS)
// -------------------------------------------------------------
router.get(
  '/counts',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { locationId } = req.query;
      const counts = await inventoryService.listStockCounts(tenantId, locationId as string);
      sendSuccess(res, counts);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/counts',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validateRequest({
    body: z.object({
      locationId: z.string().min(1, 'Location ID is required'),
      notes: z.string().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const count = await inventoryService.startStockCount(tenantId, req.body, userId);
      sendSuccess(res, count, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/counts/:id',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const count = await inventoryService.getStockCountById(tenantId, req.params.id);
      sendSuccess(res, count);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/counts/:id/scan',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  validateRequest({
    body: z.object({
      barcodeOrSku: z.string().min(1, 'Barcode or SKU is required'),
      quantity: z.number().positive().optional(),
    }),
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const updatedCount = await inventoryService.recordScannedCountItem(
        tenantId,
        {
          stockCountId: req.params.id,
          barcodeOrSku: req.body.barcodeOrSku,
          quantity: req.body.quantity,
        },
        userId
      );
      sendSuccess(res, updatedCount);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/counts/:id/complete',
  requireAuth,
  requirePermission(PERMISSIONS.INVENTORY_ADJUST),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const completed = await inventoryService.completeStockCount(tenantId, req.params.id, userId);
      sendSuccess(res, completed);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
