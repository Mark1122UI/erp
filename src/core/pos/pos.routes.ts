import { Router } from 'express';
import { z } from 'zod';
import { Product, ProductBarcode } from '../catalog/product.model.js';
import { InventoryItem } from '../inventory/inventory.model.js';
import { saleService } from '../sales/sale.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import { offlinePosService } from './offline-pos.service.js';
import mongoose from 'mongoose';

const router = Router();

// Validation Schemas
const posCheckoutSchema = z.object({
  locationId: z.string().optional(),
  customerId: z.string().optional(),
  customerName: z.string().optional(),
  items: z.array(
    z.object({
      productId: z.string().min(1, 'Product ID is required'),
      variantId: z.string().optional(),
      quantity: z.number().min(0.001, 'Quantity must be positive'),
      unitPrice: z.number().nonnegative().optional(),
      discountAmount: z.number().nonnegative().optional(),
      taxRatePercent: z.number().nonnegative().optional(),
    })
  ).min(1, 'Cart cannot be empty'),
  payments: z.array(
    z.object({
      amount: z.number().positive('Payment amount must be positive'),
      paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER']),
      provider: z.string().optional(),
      reference: z.string().optional(),
      tenderedAmount: z.number().optional(),
      changeAmount: z.number().optional(),
      notes: z.string().optional(),
    })
  ).min(1, 'At least one payment record is required'),
  notes: z.string().optional(),
});

// -------------------------------------------------------------
// 1. FAST PRODUCT & BARCODE SEARCH FOR POS
// -------------------------------------------------------------
router.get(
  '/search',
  requireAuth,
  requirePermission(PERMISSIONS.POS_ACCESS),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const tenantObjectId = new mongoose.Types.ObjectId(tenantId);
      const { query, categoryId, locationId, limit } = req.query;

      const maxLimit = Math.min(50, Math.max(1, Number(limit) || 30));
      let productQuery: any = {
        tenantId: tenantObjectId,
        isActive: true,
        isArchived: false,
      };

      if (categoryId && typeof categoryId === 'string' && categoryId !== 'ALL') {
        productQuery.categoryName = categoryId;
      }

      if (query && typeof query === 'string' && query.trim().length > 0) {
        const searchTerm = query.trim();
        const upperSearch = searchTerm.toUpperCase();

        // 1. Fast-Path: Check exact barcode or SKU first (uses unique index direct hit)
        const matchedBarcodes = await ProductBarcode.find({
          tenantId: tenantObjectId,
          barcode: searchTerm,
        })
          .select('productId')
          .lean();

        const barcodeProductIds = matchedBarcodes.map((b) => b.productId);

        if (barcodeProductIds.length > 0) {
          productQuery._id = { $in: barcodeProductIds };
        } else {
          // Check exact SKU match before regex
          const exactSkuProduct = await Product.findOne({
            tenantId: tenantObjectId,
            sku: upperSearch,
            isActive: true,
            isArchived: false,
          })
            .select('_id')
            .lean();

          if (exactSkuProduct) {
            productQuery._id = exactSkuProduct._id;
          } else {
            const searchRegex = new RegExp(searchTerm, 'i');
            productQuery.$or = [
              { name: searchRegex },
              { sku: searchRegex },
            ];
          }
        }
      }

      const products = await Product.find(productQuery)
        .select('name sku sellingPrice costPrice isTaxable taxRatePercent unit categoryName images hasVariants variants')
        .sort({ name: 1 })
        .limit(maxLimit)
        .lean();

      // Fetch stock on hand for the active location
      let stockMap: Record<string, number> = {};
      if (products.length > 0) {
        let locId = locationId as string;
        const invQuery: any = {
          tenantId: tenantObjectId,
          productId: { $in: products.map((p) => p._id) },
        };
        if (locId && mongoose.Types.ObjectId.isValid(locId)) {
          invQuery.locationId = new mongoose.Types.ObjectId(locId);
        }

        const stockItems = await InventoryItem.find(invQuery)
          .select('productId quantityOnHand')
          .lean();
        for (const it of stockItems) {
          stockMap[it.productId.toString()] = it.quantityOnHand;
        }
      }

      const results = products.map((p) => ({
        id: p._id,
        name: p.name,
        sku: p.sku,
        sellingPrice: p.sellingPrice,
        costPrice: p.costPrice,
        isTaxable: p.isTaxable,
        taxRatePercent: p.taxRatePercent,
        unit: p.unit,
        categoryName: p.categoryName,
        images: p.images,
        quantityOnHand: stockMap[p._id.toString()] ?? 0,
      }));

      sendSuccess(res, results);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. COMPLETE POS SALE (DELEGATES TO UNIVERSAL SALES ENGINE)
// -------------------------------------------------------------
router.post(
  '/checkout',
  requireAuth,
  requirePermission(PERMISSIONS.POS_ACCESS),
  validateRequest({ body: posCheckoutSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;

      // Delegate directly to the Universal Sales Engine core
      const sale = await saleService.createSale(
        tenantId,
        {
          ...req.body,
          docType: 'INVOICE',
        },
        userId
      );

      // Fetch immediate formatted receipt data
      const receipt = await saleService.getReceiptData(tenantId, sale.id);

      sendSuccess(
        res,
        {
          sale,
          receipt,
        },
        201
      );
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. OFFLINE POS CAPABILITY (Manifest Seeding & Batch Sync)
// -------------------------------------------------------------
router.get(
  '/offline-manifest',
  requireAuth,
  requirePermission(PERMISSIONS.POS_ACCESS),
  async (_req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const manifest = await offlinePosService.generateOfflineManifest(tenantId);
      sendSuccess(res, manifest);
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/offline-sync',
  requireAuth,
  requirePermission(PERMISSIONS.POS_ACCESS),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const offlineSales = Array.isArray(req.body) ? req.body : req.body.offlineSales || [];

      const result = await offlinePosService.syncOfflineBatch(tenantId, offlineSales, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
