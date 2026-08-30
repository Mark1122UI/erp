import { Router } from 'express';
import { z } from 'zod';
import { productService } from './product.service.js';
import { Category, Unit } from './product.model.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import mongoose from 'mongoose';

const router = Router();

// Validation Schemas
const barcodeSchema = z.object({
  barcode: z.string().min(1, 'Barcode string is required'),
  symbology: z.enum(['EAN13', 'UPC_A', 'CODE128', 'CODE39', 'QR', 'INTERNAL']).optional(),
  isPrimary: z.boolean().optional(),
  description: z.string().optional(),
  variantId: z.string().optional(),
});

const variantSchema = z.object({
  sku: z.string().min(1, 'Variant SKU is required'),
  name: z.string().min(1, 'Variant name is required'),
  attributes: z.record(z.string()).optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative(),
  reorderPoint: z.number().nonnegative().optional(),
  isActive: z.boolean().optional(),
});

const productBodySchema = z.object({
  name: z.string().min(1, 'Product name is required'),
  sku: z.string().min(1, 'Product SKU is required'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  brand: z.string().optional(),
  costPrice: z.number().nonnegative().optional(),
  sellingPrice: z.number().nonnegative('Selling price must be greater than or equal to 0'),
  isTaxable: z.boolean().optional(),
  taxRatePercent: z.number().nonnegative().optional(),
  unit: z.string().optional(),
  reorderPoint: z.number().nonnegative().optional(),
  trackInventory: z.boolean().optional(),
  primarySupplierId: z.string().optional(),
  supplierProductCode: z.string().optional(),
  barcodes: z.array(barcodeSchema).optional(),
  hasVariants: z.boolean().optional(),
  variants: z.array(variantSchema).optional(),
  tags: z.array(z.string()).optional(),
  images: z.array(z.object({ url: z.string(), alt: z.string().optional(), isPrimary: z.boolean().optional() })).optional(),
});

const listProductsQuerySchema = z.object({
  search: z.string().optional(),
  categoryId: z.string().optional(),
  categoryName: z.string().optional(),
  brand: z.string().optional(),
  isArchived: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  isActive: z.string().optional().transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  primarySupplierId: z.string().optional(),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const importBodySchema = z.object({
  rows: z.array(
    z.object({
      name: z.string(),
      sku: z.string(),
      sellingPrice: z.union([z.number(), z.string()]),
      costPrice: z.union([z.number(), z.string()]).optional(),
      barcode: z.string().optional(),
      barcodeSymbology: z.enum(['EAN13', 'UPC_A', 'CODE128', 'CODE39', 'QR', 'INTERNAL']).optional(),
      categoryName: z.string().optional(),
      brand: z.string().optional(),
      unit: z.string().optional(),
    })
  ),
});

// -------------------------------------------------------------
// PRODUCT ENDPOINTS
// -------------------------------------------------------------

// 1. List Products (with filters & search)
router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_READ),
  validateRequest({ query: listProductsQuerySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const result = await productService.listProducts(tenantId, req.query as any);
      sendSuccess(res, result.products, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

// 2. Create Product
router.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_CREATE),
  validateRequest({ body: productBodySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const product = await productService.createProduct(tenantId, req.body, userId);
      sendSuccess(res, product, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 3. Import Products from CSV Data
router.post(
  '/import',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_CREATE),
  validateRequest({ body: importBodySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await productService.validateAndImportCsv(tenantId, req.body.rows, userId);

      if (!result.success) {
        res.status(400).json({
          success: false,
          error: {
            code: 'IMPORT_VALIDATION_FAILED',
            message: `CSV Import validation failed with ${result.errors.length} errors`,
            details: result.errors,
          },
        });
        return;
      }

      sendSuccess(res, {
        importedCount: result.importedCount,
        message: `Successfully imported ${result.importedCount} products`,
      }, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 4. Get Product Details (with barcodes)
router.get(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const product = await productService.getProductById(tenantId, req.params.id);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
);

// 5. Update Product
router.patch(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_UPDATE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: productBodySchema.partial(),
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const product = await productService.updateProduct(tenantId, req.params.id, req.body, userId);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
);

// 6. Add Barcode to Product
router.post(
  '/:id/barcodes',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_UPDATE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: barcodeSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const barcode = await productService.addBarcode(tenantId, req.params.id, req.body);
      sendSuccess(res, barcode, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 7. Delete Barcode
router.delete(
  '/barcodes/:barcodeId',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_UPDATE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      await productService.removeBarcode(tenantId, req.params.barcodeId);
      sendSuccess(res, { message: 'Barcode removed successfully' });
    } catch (error) {
      next(error);
    }
  }
);

// 8. Archive Product
router.patch(
  '/:id/archive',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_DELETE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const product = await productService.setArchiveStatus(tenantId, req.params.id, true, userId);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
);

// 9. Restore Product
router.patch(
  '/:id/restore',
  requireAuth,
  requirePermission(PERMISSIONS.PRODUCTS_DELETE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const product = await productService.setArchiveStatus(tenantId, req.params.id, false, userId);
      sendSuccess(res, product);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// CATEGORY & UNIT HELPER ROUTES
// -------------------------------------------------------------
router.get('/meta/categories', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const categories = await Category.find({ tenantId: new mongoose.Types.ObjectId(tenantId), isActive: true }).lean();
    sendSuccess(res, categories);
  } catch (error) {
    next(error);
  }
});

router.get('/meta/units', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    let units = await Unit.find({ tenantId: new mongoose.Types.ObjectId(tenantId), isActive: true }).lean();
    if (units.length === 0) {
      // Default common units
      units = [
        { code: 'PCS', name: 'Piece', isDecimalAllowed: false },
        { code: 'BOX', name: 'Box', isDecimalAllowed: false },
        { code: 'KG', name: 'Kilogram', isDecimalAllowed: true },
        { code: 'L', name: 'Liter', isDecimalAllowed: true },
        { code: 'PACK', name: 'Pack', isDecimalAllowed: false },
      ] as any;
    }
    sendSuccess(res, units);
  } catch (error) {
    next(error);
  }
});

export default router;
