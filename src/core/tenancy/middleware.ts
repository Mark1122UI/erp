import { Request, Response, NextFunction } from 'express';
import { contextProvider } from '../common/context.js';
import { Tenant } from './tenant.model.js';
import { NotFoundError, UnauthorizedError } from '../common/errors.js';
import mongoose from 'mongoose';

export async function tenantResolverMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  const requestId = (req.headers['x-request-id'] as string) || `req_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const ipAddress = req.ip || req.socket.remoteAddress || '127.0.0.1';
  const userAgent = req.headers['user-agent'] || 'unknown';

  // 1. Resolve Tenant ID from Header, Subdomain, or Auth Context
  let tenantId = req.headers['x-tenant-id'] as string;

  // Extract from Host Subdomain if header not explicitly passed
  if (!tenantId && req.hostname) {
    const parts = req.hostname.split('.');
    if (parts.length > 2 && parts[0] !== 'api' && parts[0] !== 'www' && parts[0] !== 'localhost') {
      const tenant = await Tenant.findOne({ slug: parts[0].toLowerCase(), isActive: true });
      if (tenant) {
        tenantId = tenant.id;
      }
    }
  }

  // Populate context inside AsyncLocalStorage
  contextProvider.run(
    {
      tenantId: tenantId && mongoose.Types.ObjectId.isValid(tenantId) ? tenantId : undefined,
      requestId,
      ipAddress,
      userAgent,
    },
    () => {
      next();
    }
  );
}

export function requireTenantContext(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const tenantId = contextProvider.getTenantId();
  if (!tenantId) {
    next(new UnauthorizedError('Valid tenant context required (X-Tenant-ID header or active session)'));
    return;
  }
  next();
}
