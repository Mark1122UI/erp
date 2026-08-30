import { Router } from 'express';
import { z } from 'zod';
import { userService } from './user.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

const inviteSchema = z.object({
  email: z.string().email('Valid email address required'),
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  role: z.enum(['Owner', 'Manager', 'Sales', 'Cashier', 'Inventory Manager', 'Accountant', 'Staff']),
});

const acceptInviteSchema = z.object({
  token: z.string().min(1, 'Invitation token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters').optional(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

const roleSchema = z.object({
  role: z.enum(['Owner', 'Manager', 'Sales', 'Cashier', 'Inventory Manager', 'Accountant', 'Staff']),
});

const statusSchema = z.object({
  status: z.enum(['ACTIVE', 'INVITED', 'SUSPENDED', 'DEACTIVATED']),
});

// List Users
router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.USERS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const users = await userService.listTenantUsers(tenantId);
      sendSuccess(res, users);
    } catch (error) {
      next(error);
    }
  }
);

// Invite User
router.post(
  '/invite',
  requireAuth,
  requirePermission(PERMISSIONS.USERS_INVITE),
  validateRequest({ body: inviteSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await userService.inviteUser(tenantId, req.body, userId);
      sendSuccess(res, result, 201);
    } catch (error) {
      next(error);
    }
  }
);

// Public Accept Invitation
router.post(
  '/accept-invitation',
  validateRequest({ body: acceptInviteSchema }),
  async (req, res, next) => {
    try {
      const result = await userService.acceptInvitation(
        req.body.token,
        req.body.password,
        req.body.firstName,
        req.body.lastName
      );
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// Update User Role
router.patch(
  '/:id/role',
  requireAuth,
  requirePermission(PERMISSIONS.USERS_UPDATE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: roleSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await userService.updateUserRole(tenantId, req.params.id, req.body.role, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

// Update User Status (Activate/Deactivate)
router.patch(
  '/:id/status',
  requireAuth,
  requirePermission(PERMISSIONS.USERS_DEACTIVATE),
  validateRequest({
    params: z.object({ id: z.string() }),
    body: statusSchema,
  }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const result = await userService.updateUserStatus(tenantId, req.params.id, req.body.status, userId);
      sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
);

export default router;
