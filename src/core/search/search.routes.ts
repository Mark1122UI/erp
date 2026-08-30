import { Router } from 'express';
import { searchService } from './search.service.js';
import { requireAuth } from '../identity/auth.middleware.js';
import { sendSuccess } from '../common/response.js';
import { contextProvider } from '../common/context.js';

const router = Router();

router.get('/', requireAuth, async (req, res, next) => {
  try {
    const tenantId = contextProvider.getRequiredTenantId();
    const query = (req.query.query as string) || (req.query.q as string) || '';
    const limit = req.query.limit ? Number(req.query.limit) : 10;

    const results = await searchService.globalSearch(tenantId, query, limit);
    sendSuccess(res, results);
  } catch (error) {
    next(error);
  }
});

export default router;
