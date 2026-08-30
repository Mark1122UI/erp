import { Router } from 'express';
import { z } from 'zod';
import { integrationService } from './integration.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

const connectStoreSchema = z.object({
  provider: z.enum(['SHOPIFY', 'WOOCOMMERCE', 'CUSTOM_API', 'MARKETPLACE']),
  name: z.string().min(1, 'Store name is required'),
  storeUrl: z.string().optional(),
  apiKey: z.string().optional(),
  apiSecret: z.string().optional(),
  accessToken: z.string().optional(),
  settings: z
    .object({
      autoSyncOrders: z.boolean().optional(),
      autoSyncInventory: z.boolean().optional(),
      syncIntervalMinutes: z.number().int().positive().optional(),
      defaultLocationId: z.string().optional(),
      priceTier: z.string().optional(),
    })
    .optional(),
});

const triggerSyncSchema = z.object({
  syncType: z.enum(['PRODUCTS', 'INVENTORY', 'ORDERS', 'CUSTOMERS', 'FULL']).default('FULL'),
});

// 1. List available integration providers
router.get(
  '/providers',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (_req, res) => {
    const catalog = integrationService.getProviderCatalog();
    sendSuccess(res, catalog);
  }
);

// 2. Initiate OAuth2 authorization URL
router.get(
  '/oauth/authorize',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { provider, redirectUri, storeName } = req.query;

      const result = await integrationService.getOAuthUrl(
        tenantId,
        provider as any,
        (redirectUri as string) || `${req.protocol}://${req.get('host')}/api/v1/integrations/oauth/callback`,
        storeName as string
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// 3. OAuth2 Callback handler
router.get(
  '/oauth/callback',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const { code, state, shop, provider } = req.query;

      const connection = await integrationService.handleOAuthCallback(
        tenantId,
        (provider as any) || 'SHOPIFY',
        {
          code: code as string,
          state: state as string,
          shop: shop as string,
        },
        userId
      );

      sendSuccess(res, connection, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 4. List connected stores (Credentials masked)
router.get(
  '/connections',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (_req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const connections = await integrationService.listConnections(tenantId);
      sendSuccess(res, connections);
    } catch (error) {
      next(error);
    }
  }
);

// 5. Connect store directly (API Key / Custom / Direct)
router.post(
  '/connections',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  validateRequest({ body: connectStoreSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const connection = await integrationService.connectStore(tenantId, req.body, userId);
      sendSuccess(res, connection, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 6. Get single connection
router.get(
  '/connections/:id',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const connection = await integrationService.getConnection(tenantId, req.params.id);
      sendSuccess(res, connection);
    } catch (error) {
      next(error);
    }
  }
);

// 7. Disconnect store (purge credentials & mappings)
router.delete(
  '/connections/:id',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      await integrationService.disconnectStore(tenantId, req.params.id, userId);
      sendSuccess(res, { message: 'Store disconnected and credentials purged' });
    } catch (error) {
      next(error);
    }
  }
);

// 8. Trigger manual sync
router.post(
  '/connections/:id/sync',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  validateRequest({ body: triggerSyncSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await integrationService.triggerSync(
        tenantId,
        req.params.id,
        req.body.syncType,
        userId
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// 9. View integration logs & sync history
router.get(
  '/connections/:id/logs',
  requireAuth,
  requirePermission(PERMISSIONS.INTEGRATIONS_MANAGE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const limit = req.query.limit ? Number(req.query.limit) : 50;
      const logs = await integrationService.getLogs(tenantId, req.params.id, limit);
      sendSuccess(res, logs);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
