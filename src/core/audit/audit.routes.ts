import { Router } from 'express';
import { auditService } from './audit.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';
import { z } from 'zod';
import { validateRequest } from '../common/validator.js';

const router = Router();

const querySchema = z.object({
  action: z.enum([
    'CREATE',
    'UPDATE',
    'DELETE',
    'LOGIN',
    'LOGOUT',
    'PAYMENT',
    'REFUND',
    'STOCK_ADJUSTMENT',
    'PERMISSION_CHANGE',
    'EXPORT',
  ]).optional(),
  entity: z.string().optional(),
  userId: z.string().optional(),
  startDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  endDate: z.string().datetime().optional().transform((val) => (val ? new Date(val) : undefined)),
  page: z.string().optional().transform(Number),
  limit: z.string().optional().transform(Number),
});

router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.AUDIT_READ),
  validateRequest({ query: querySchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const result = await auditService.queryLogs(tenantId, req.query as any);
      sendSuccess(res, result.records, 200, { pagination: result.pagination });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
