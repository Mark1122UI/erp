import { Router } from 'express';
import { z } from 'zod';
import { taskService } from './task.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { requirePermission } from '../rbac/middleware.js';
import { PERMISSIONS } from '../rbac/permissions.js';
import { validateRequest } from '../common/validator.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

const createTaskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  relatedEntity: z
    .object({
      entityType: z.enum([
        'CUSTOMER',
        'SUPPLIER',
        'SALE',
        'INVOICE',
        'PRODUCT',
        'PURCHASE_ORDER',
        'SUPPLIER_BILL',
      ]),
      entityId: z.string().min(1),
      entityName: z.string().optional(),
    })
    .optional(),
  tags: z.array(z.string()).optional(),
});

const updateTaskSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  status: z.enum(['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  tags: z.array(z.string()).optional(),
});

// 1. List tasks
router.get(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.TASKS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const { status, priority, assignedTo, relatedEntityType, relatedEntityId, search, limit } = req.query;

      const tasks = await taskService.listTasks(tenantId, {
        status: status as string,
        priority: priority as string,
        assignedTo: assignedTo as string,
        relatedEntityType: relatedEntityType as string,
        relatedEntityId: relatedEntityId as string,
        search: search as string,
        limit: limit ? Number(limit) : 50,
      });

      sendSuccess(res, tasks);
    } catch (error) {
      next(error);
    }
  }
);

// 2. Create task
router.post(
  '/',
  requireAuth,
  requirePermission(PERMISSIONS.TASKS_WRITE),
  validateRequest({ body: createTaskSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const task = await taskService.createTask(tenantId, req.body, userId);
      sendSuccess(res, task, 201);
    } catch (error) {
      next(error);
    }
  }
);

// 3. Get single task
router.get(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.TASKS_READ),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const task = await taskService.getTaskById(tenantId, req.params.id);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }
);

// 4. Update task
router.patch(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.TASKS_WRITE),
  validateRequest({ body: updateTaskSchema }),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      const task = await taskService.updateTask(tenantId, req.params.id, req.body, userId);
      sendSuccess(res, task);
    } catch (error) {
      next(error);
    }
  }
);

// 5. Delete task
router.delete(
  '/:id',
  requireAuth,
  requirePermission(PERMISSIONS.TASKS_WRITE),
  async (req, res, next) => {
    try {
      const tenantId = contextProvider.getRequiredTenantId();
      const userId = contextProvider.getUserId()!;
      await taskService.deleteTask(tenantId, req.params.id, userId);
      sendSuccess(res, { message: 'Task deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
