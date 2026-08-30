import { Request, Response, NextFunction } from 'express';
import { Permission, SystemRole, ROLE_PERMISSIONS } from './permissions.js';
import { ForbiddenError, UnauthorizedError } from '../common/errors.js';
import { contextProvider } from '../common/context.js';

export function requirePermission(...requiredPermissions: Permission[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = contextProvider.get();
    
    if (!context.userId || !context.tenantId) {
      next(new UnauthorizedError('Authentication and tenant context required'));
      return;
    }

    const userRole = context.role as SystemRole;
    if (!userRole) {
      next(new ForbiddenError('No role assigned to user for this business'));
      return;
    }

    // Owner has unrestricted permissions across all modules
    if (userRole === 'Owner') {
      next();
      return;
    }

    const grantedPermissions = context.permissions || ROLE_PERMISSIONS[userRole] || [];
    const hasAll = requiredPermissions.every((perm) => grantedPermissions.includes(perm));

    if (!hasAll) {
      next(new ForbiddenError(`Missing required permission: ${requiredPermissions.join(', ')}`));
      return;
    }

    next();
  };
}

export function requireRole(...allowedRoles: SystemRole[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const context = contextProvider.get();
    
    if (!context.userId || !context.tenantId) {
      next(new UnauthorizedError('Authentication and tenant context required'));
      return;
    }

    const userRole = context.role as SystemRole;
    if (!userRole || !allowedRoles.includes(userRole)) {
      next(new ForbiddenError(`Requires one of roles: ${allowedRoles.join(', ')}`));
      return;
    }

    next();
  };
}
