import { Router } from 'express';
import { z } from 'zod';
import { tenantService } from './tenant.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

const setupSchema = z.object({
  name: z.string().min(2, 'Business name must be at least 2 characters'),
  country: z.string().min(2, 'Country is required'),
  currency: z.string().min(3, 'Currency code is required (e.g. USD, EUR, GBP)'),
  timezone: z.string().min(2, 'Timezone is required'),
  businessType: z.enum([
    'RETAIL',
    'ECOMMERCE',
    'HYBRID_RETAIL',
    'SERVICES',
    'MANUFACTURING',
    'HEALTHCARE',
    'CONSTRUCTION',
    'OTHER',
  ]),
  phone: z.string().optional(),
  email: z.string().email('Valid email required').optional(),
  address: z
    .object({
      street: z.string().optional(),
      city: z.string().optional(),
      state: z.string().optional(),
      postalCode: z.string().optional(),
      country: z.string().optional(),
    })
    .optional(),
  logoUrl: z.string().url('Must be a valid URL').optional(),
});

const onboardingSchema = z.object({
  business: z
    .object({
      name: z.string().optional(),
      country: z.string().optional(),
      currency: z.string().optional(),
      timezone: z.string().optional(),
      businessType: z.string().optional(),
      phone: z.string().optional(),
      email: z.string().optional(),
      address: z
        .object({
          street: z.string().optional(),
          city: z.string().optional(),
          state: z.string().optional(),
          postalCode: z.string().optional(),
          country: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  location: z
    .object({
      name: z.string().optional(),
      code: z.string().optional(),
      street: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
  products: z
    .array(
      z.object({
        name: z.string(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        sellingPrice: z.number().nonnegative(),
        costPrice: z.number().nonnegative().optional(),
        categoryName: z.string().optional(),
        initialStock: z.number().optional(),
      })
    )
    .optional(),
  loadSampleProducts: z.boolean().optional(),
  markComplete: z.boolean().optional(),
});

const generalSettingsSchema = z.object({
  taxNumber: z.string().optional(),
  receiptHeader: z.string().optional(),
  receiptFooter: z.string().optional(),
  allowNegativeStock: z.boolean().optional(),
  defaultTaxRate: z.number().optional(),
  pricesIncludeTax: z.boolean().optional(),
  taxRates: z
    .array(
      z.object({
        name: z.string(),
        rate: z.number(),
        isDefault: z.boolean().optional(),
        code: z.string().optional(),
      })
    )
    .optional(),
  receiptShowLogo: z.boolean().optional(),
  receiptShowTax: z.boolean().optional(),
  receiptShowBarcode: z.boolean().optional(),
  receiptWidth: z.enum(['58mm', '80mm']).optional(),
  receiptTerms: z.string().optional(),
  invoicePrefix: z.string().optional(),
  nextInvoiceNumber: z.number().optional(),
  paymentTerms: z.string().optional(),
  invoiceDefaultNotes: z.string().optional(),
  invoiceBankDetails: z.string().optional(),
  invoiceDueDays: z.number().optional(),
  currencySymbol: z.string().optional(),
  currencyPosition: z.enum(['before', 'after']).optional(),
  decimalPlaces: z.number().optional(),
  thousandSeparator: z.string().optional(),
  decimalSeparator: z.string().optional(),
  emailAlertsEnabled: z.boolean().optional(),
  lowStockAlertThreshold: z.number().optional(),
  lowStockEmailRecipient: z.string().optional(),
  dailySalesSummaryEmail: z.boolean().optional(),
  orderNotificationsEnabled: z.boolean().optional(),
  apiKey: z.string().optional(),
  webhookUrl: z.string().optional(),
  shopifyConnected: z.boolean().optional(),
  stripeConnected: z.boolean().optional(),
  quickbooksConnected: z.boolean().optional(),
  sessionTimeoutMinutes: z.number().optional(),
  twoFactorRequired: z.boolean().optional(),
  passwordExpiryDays: z.number().optional(),
  customCss: z.string().optional(),
  webhookSecret: z.string().optional(),
  rawConfigJson: z.string().optional(),
  debugMode: z.boolean().optional(),
});

// -------------------------------------------------------------
// 1. SETUP CHECKLIST ENDPOINT
// -------------------------------------------------------------
router.get(
  '/checklist',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const checklist = await tenantService.getSetupChecklist(tenantId);
      sendSuccess(res, checklist);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. STREAMLINED ONBOARDING WIZARD PROCESSOR
// -------------------------------------------------------------
router.post(
  '/onboarding',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  validateRequest({ body: onboardingSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await tenantService.completeOnboarding(tenantId, req.body, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. 1-CLICK SAMPLE STARTER DATA PACK
// -------------------------------------------------------------
router.post(
  '/sample-data',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      await tenantService.loadSampleData(tenantId, userId);
      const checklist = await tenantService.getSetupChecklist(tenantId);
      sendSuccess(res, { message: 'Sample starter catalog loaded successfully', checklist });
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 4. BUSINESS DETAILS & LEGACY SETUP
// -------------------------------------------------------------
router.post(
  '/setup',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  validateRequest({ body: setupSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const updatedTenant = await tenantService.setupBusiness(tenantId, req.body, userId);
      sendSuccess(res, updatedTenant);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/current',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const tenant = await tenantService.getTenantById(tenantId);
      sendSuccess(res, tenant);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 5. SETTINGS HUB (CATEGORIZED & GRANULAR)
// -------------------------------------------------------------
router.get(
  '/settings',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const settings = await tenantService.getCategorizedSettings(tenantId);
      sendSuccess(res, settings);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/roles',
  requireAuth,
  requirePermission(PERMISSIONS.USERS_READ),
  async (req, res, next) => {
    try {
      const roles = tenantService.getRolesAndPermissions();
      sendSuccess(res, roles);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/settings/:category',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const category = req.params.category;
      const updated = await tenantService.updateCategorySettings(tenantId, category, req.body, userId);
      sendSuccess(res, updated);
    } catch (error) {
      next(error);
    }
  }
);

router.patch(
  '/settings',
  requireAuth,
  requirePermission(PERMISSIONS.TENANT_SETTINGS),
  validateRequest({ body: generalSettingsSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const updatedTenant = await tenantService.updateTenantSettings(tenantId, req.body, userId);
      sendSuccess(res, updatedTenant);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
