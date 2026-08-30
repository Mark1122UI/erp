import { Router } from 'express';
import { notificationService } from './notification.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

// 1. List current user's notifications
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const userId = contextProvider.getUserId()!;
    const unreadOnly = req.query.unreadOnly === 'true';
    const limit = req.query.limit ? Number(req.query.limit) : 50;

    const result = await notificationService.listUserNotifications(tenantId, userId, {
      unreadOnly,
      limit,
    });
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

// 2. Mark specific notification as read
router.patch('/:id/read', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const userId = contextProvider.getUserId()!;
    const updated = await notificationService.markAsRead(tenantId, req.params.id, userId);
    sendSuccess(res, updated);
  } catch (error) {
    next(error);
  }
});

// 3. Mark all notifications as read
router.post('/mark-all-read', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const userId = contextProvider.getUserId()!;
    const result = await notificationService.markAllAsRead(tenantId, userId);
    sendSuccess(res, result);
  } catch (error) {
    next(error);
  }
});

export default router;
