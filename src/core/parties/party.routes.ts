import { Router } from 'express';
import { z } from 'zod';
import { partyService } from './party.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import { User } from '../identity/user.model.js';

const router = Router();

// Validation Schemas
const addressSchema = z
  .object({
    street: z.string().optional(),
    city: z.string().optional(),
    state: z.string().optional(),
    postalCode: z.string().optional(),
    country: z.string().optional(),
  })
  .optional();

const partyBodySchema = z.object({
  type: z.enum(['INDIVIDUAL', 'ORGANIZATION']).default('INDIVIDUAL'),
  roles: z.array(z.enum(['CUSTOMER', 'SUPPLIER', 'DISTRIBUTOR', 'CONTRACTOR', 'PARTNER', 'OTHER'])).min(1),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  salutation: z.string().optional(),
  companyName: z.string().optional(),
  taxNumber: z.string().optional(),
  website: z.string().optional(),
  industry: z.string().optional(),
  email: z.string().email('Valid email format required').optional().or(z.literal('')),
  phone: z.string().optional(),
  mobile: z.string().optional(),
  billingAddress: addressSchema,
  shippingAddress: addressSchema,
  customerDetails: z
    .object({
      creditLimit: z.number().nonnegative().optional(),
      paymentTermsDays: z.number().int().nonnegative().optional(),
      priceTier: z.string().optional(),
      taxExempt: z.boolean().optional(),
    })
    .optional(),
  supplierDetails: z
    .object({
      defaultPaymentTermsDays: z.number().int().nonnegative().optional(),
      bankDetails: z
        .object({
          bankName: z.string().optional(),
          accountNumber: z.string().optional(),
          routingCode: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
  initialNote: z.string().optional(),
});

const listQuerySchema = z.object({
  search: z.string().optional(),
  isArchived: z
    .string()
    .optional()
    .transform((val) => (val === 'true' ? true : val === 'false' ? false : undefined)),
  hasBalance: z
    .string()
    .optional()
    .transform((val) => val === 'true'),
  tag: z.string().optional(),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
});

const noteSchema = z.object({
  content: z.string().min(1, 'Note content cannot be empty'),
});

const transactionSchema = z.object({
  type: z.enum(['INVOICE', 'PAYMENT', 'BILL', 'PURCHASE', 'REFUND', 'CREDIT_NOTE']),
  amount: z.number().positive('Amount must be greater than 0'),
  currency: z.string().optional(),
  status: z.enum(['PAID', 'PENDING', 'OVERDUE', 'VOID']).optional(),
  reference: z.string().optional(),
  description: z.string().optional(),
});

async function getUserFullName(userId: string): Promise<string> {
  const user = await User.findById(userId).select('firstName lastName email');
  return user ? `${user.firstName} ${user.lastName}`.trim() || user.email : 'System User';
}

// -------------------------------------------------------------
// CUSTOMER ROUTES
// -------------------------------------------------------------
export const customerRouter = Router();

customerRouter.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_READ),
  validateRequest({ query: listQuerySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const result = await partyService.listParties(tenantId, {
        ...(req.query as any),
        role: 'CUSTOMER',
      });
      sendSuccess(res, result.parties, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  validateRequest({ body: partyBodySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      // Ensure CUSTOMER role is included
      const roles = Array.from(new Set([...(req.body.roles || []), 'CUSTOMER'])) as any;

      const customer = await partyService.createParty(
        tenantId,
        { ...req.body, roles },
        userId,
        userName
      );
      sendSuccess(res, customer, 201);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.get(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const customer = await partyService.getPartyById(tenantId, req.params.id);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.patch(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: partyBodySchema.partial(),
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const customer = await partyService.updateParty(
        tenantId,
        req.params.id,
        req.body as any,
        userId,
        userName
      );
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.post(
  '/:id/notes',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: noteSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const customer = await partyService.addNote(
        tenantId,
        req.params.id,
        req.body.content,
        userId,
        userName
      );
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.post(
  '/:id/transactions',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: transactionSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const customer = await partyService.recordTransaction(
        tenantId,
        req.params.id,
        req.body,
        userId,
        userName
      );
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.patch(
  '/:id/archive',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const customer = await partyService.setArchiveStatus(tenantId, req.params.id, true, userId, userName);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

customerRouter.patch(
  '/:id/restore',
  requireAuth,
  requirePermission(PERMISSIONS.CUSTOMERS_WRITE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const customer = await partyService.setArchiveStatus(tenantId, req.params.id, false, userId, userName);
      sendSuccess(res, customer);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// SUPPLIER ROUTES
// -------------------------------------------------------------
export const supplierRouter = Router();

supplierRouter.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_READ),
  validateRequest({ query: listQuerySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const result = await partyService.listParties(tenantId, {
        ...(req.query as any),
        role: 'SUPPLIER',
      });
      sendSuccess(res, result.parties, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  validateRequest({ body: partyBodySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      // Ensure SUPPLIER role is included
      const roles = Array.from(new Set([...(req.body.roles || []), 'SUPPLIER'])) as any;

      const supplier = await partyService.createParty(
        tenantId,
        { ...req.body, roles },
        userId,
        userName
      );
      sendSuccess(res, supplier, 201);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.get(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const supplier = await partyService.getPartyById(tenantId, req.params.id);
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.patch(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: partyBodySchema.partial(),
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const supplier = await partyService.updateParty(
        tenantId,
        req.params.id,
        req.body as any,
        userId,
        userName
      );
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.post(
  '/:id/notes',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: noteSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const supplier = await partyService.addNote(
        tenantId,
        req.params.id,
        req.body.content,
        userId,
        userName
      );
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.post(
  '/:id/transactions',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: transactionSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const supplier = await partyService.recordTransaction(
        tenantId,
        req.params.id,
        req.body,
        userId,
        userName
      );
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.patch(
  '/:id/archive',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const supplier = await partyService.setArchiveStatus(tenantId, req.params.id, true, userId, userName);
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

supplierRouter.patch(
  '/:id/restore',
  requireAuth,
  requirePermission(PERMISSIONS.SUPPLIERS_WRITE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const userName = await getUserFullName(userId);

      const supplier = await partyService.setArchiveStatus(tenantId, req.params.id, false, userId, userName);
      sendSuccess(res, supplier);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
