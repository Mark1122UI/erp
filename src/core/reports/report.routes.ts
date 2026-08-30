import { Router } from 'express';
import { reportService } from './report.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

// -------------------------------------------------------------
// 1. SALES REPORTS
// -------------------------------------------------------------
router.get(
  '/sales/summary',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getSalesSummary(tenantId, req.query);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sales/by-date',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getSalesByDate(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('sales-by-date.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sales/by-product',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getSalesByProduct(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('sales-by-product.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sales/by-category',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getSalesByCategory(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('sales-by-category.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sales/by-employee',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getSalesByEmployee(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('sales-by-employee.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/sales/by-payment-method',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getPaymentMethodSummary(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('sales-by-payment-method.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 2. INVENTORY REPORTS
// -------------------------------------------------------------
router.get(
  '/inventory/current',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getCurrentStock(tenantId, {
        locationId: req.query.locationId as string,
      });
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('inventory-current-stock.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/inventory/low-stock',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getCurrentStock(tenantId, {
        locationId: req.query.locationId as string,
        lowStockOnly: true,
      });
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/inventory/valuation',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (_req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getStockValuation(tenantId);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/inventory/movements',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getStockMovements(tenantId, req.query);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

router.get(
  '/inventory/adjustments',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getStockAdjustments(tenantId, req.query);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 3. PURCHASES REPORTS
// -------------------------------------------------------------
router.get(
  '/purchases/by-supplier',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getPurchasesBySupplier(tenantId, req.query);
      if (req.query.format === 'csv') {
        const csv = reportService.convertToCsv(report);
        res.header('Content-Type', 'text/csv');
        res.attachment('purchases-by-supplier.csv');
        return res.send(csv);
      }
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

// -------------------------------------------------------------
// 4. FINANCIAL SUMMARY REPORT (MONEY)
// -------------------------------------------------------------
router.get(
  '/money/summary',
  requireAuth,
  requirePermission(PERMISSIONS.REPORTS_VIEW),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const report = await reportService.getFinancialSummary(tenantId, req.query);
      sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
