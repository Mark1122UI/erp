import { Request, Response, NextFunction } from 'express';
import { tokenService } from './token.service.js';
import { UnauthorizedError, ForbiddenError } from '../common/errors.js';
import { contextProvider } from '../common/context.js';
import { User } from './user.model.js';
import { ROLE_PERMISSIONS, SystemRole } from '../rbac/permissions.js';

export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // 1. Extract Token from HttpOnly Cookie or Bearer Header
    let token = req.cookies?.access_token;

    if (!token && req.headers.authorization?.startsWith('Bearer ')) {
      token = req.headers.authorization.substring(7);
    }

    if (!token) {
      throw new UnauthorizedError('Authentication required: please log in');
    }

    // 2. Verify Token
    let payload;
    try {
      payload = tokenService.verifyAccessToken(token);
    } catch (err: any) {
      if (err.name === 'TokenExpiredError') {
        throw new UnauthorizedError('Session expired: please refresh token or log in again', { expired: true });
      }
      throw new UnauthorizedError('Invalid authentication token');
    }

    // 3. Optional header override for tenant if authorized member
    const headerTenantId = req.headers['x-tenant-id'] as string;
    const effectiveTenantId = headerTenantId || payload.tenantId;

    // 4. Validate User & Membership
    const user = await User.findById(payload.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('User account not found or deactivated');
    }

    const membership = user.memberships.find(
      (m) => m.tenantId.toString() === effectiveTenantId && m.status === 'ACTIVE'
    );

    if (!membership) {
      throw new ForbiddenError('You do not have active access to this business tenant');
    }

    const role = membership.role as SystemRole;
    const permissions = ROLE_PERMISSIONS[role] || [];

    // 5. Populate Context in AsyncLocalStorage
    contextProvider.set({
      tenantId: effectiveTenantId,
      userId: user.id,
      userEmail: user.email,
      role,
      permissions,
    });

    next();
  } catch (error) {
    next(error);
  }
}
