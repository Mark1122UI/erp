import { Router } from 'express';
import { z } from 'zod';
import { moneyService } from './money.service.js';
import { DEFAULT_EXPENSE_CATEGORIES } from './money.model.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

// Validation Schemas
const createExpenseSchema = z.object({
  category: z.string().min(1, 'Category is required'),
  amount: z.number().positive('Amount must be positive'),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'CREDIT', 'OTHER']),
  expenseDate: z.string().optional().transform((v) => (v ? new Date(v) : undefined)),
  reference: z.string().optional(),
  notes: z.string().optional(),
  attachmentUrl: z.string().optional(),
});

// -------------------------------------------------------------
// 1. ROLE-AWARE DASHBOARD & MONEY SUMMARY
// -------------------------------------------------------------
router.get(
  '/dashboard',
  requireAuth,
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userRole = (req as any).user?.role;
      const dashboard = await moneyService.getDashboard(tenantId, userRole);
      sendSuccess(res, dashboard);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/summary',
  requireAuth,
  requirePermission(PERMISSIONS.FINANCIALS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const summary = await moneyService.getMoneySummary(tenantId);
      sendSuccess(res, summary);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. EXPENSES CRUD & CATEGORIES
// -------------------------------------------------------------
router.get(
  '/expenses',
  requireAuth,
  requirePermission(PERMISSIONS.FINANCIALS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { category, startDate, endDate, search, page, limit } = req.query;

      const result = await moneyService.listExpenses(tenantId, {
        category: category as string,
        startDate: startDate ? new Date(startDate as string) : undefined,
        endDate: endDate ? new Date(endDate as string) : undefined,
        search: search as string,
        page: page ? Number(page) : undefined,
        limit: limit ? Number(limit) : undefined,
      });

      sendSuccess(res, result.expenses, 200, {
        pagination: result.pagination,
        categories: result.categories,
      });
    } catch (error) {
      next(error);
    }
  }
);

router.post(
  '/expenses',
  requireAuth,
  requirePermission(PERMISSIONS.FINANCIALS_READ),
  validateRequest({ body: createExpenseSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const expense = await moneyService.createExpense(tenantId, req.body, userId);
      sendSuccess(res, expense, 201);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/expenses/categories',
  requireAuth,
  (req, res) => {
    sendSuccess(res, DEFAULT_EXPENSE_CATEGORIES);
  }
);

export default router;
