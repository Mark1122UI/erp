import { AuditLog, AuditAction, IAuditLog } from './audit.model.js';
import { contextProvider } from '../common/context.js';
import mongoose from 'mongoose';

export interface LogAuditParams {
  tenantId?: string;
  userId?: string;
  userEmail?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

const SENSITIVE_KEYS = ['password', 'passwordHash', 'pin', 'token', 'secret', 'refreshToken', 'authorization', 'card', 'cvv'];

function sanitizeMetadata(data?: Record<string, any>): Record<string, any> | undefined {
  if (!data) return undefined;
  const sanitized: Record<string, any> = {};

  for (const [key, value] of Object.entries(data)) {
    if (SENSITIVE_KEYS.some((sensitive) => key.toLowerCase().includes(sensitive.toLowerCase()))) {
      sanitized[key] = '[REDACTED]';
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      sanitized[key] = sanitizeMetadata(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

export const auditService = {
  async log(params: LogAuditParams): Promise<IAuditLog | null> {
    try {
      const context = contextProvider.get();
      const tenantId = params.tenantId || context.tenantId;

      if (!tenantId) {
        // Cannot log audit record without tenant boundary
        return null;
      }

      const audit = await AuditLog.create({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: params.userId || (context.userId && mongoose.Types.ObjectId.isValid(context.userId) ? new mongoose.Types.ObjectId(context.userId) : undefined),
        userEmail: params.userEmail || context.userEmail,
        action: params.action,
        entity: params.entity,
        entityId: params.entityId,
        metadata: sanitizeMetadata(params.metadata),
        ipAddress: params.ipAddress || context.ipAddress,
        userAgent: params.userAgent || context.userAgent,
      });

      return audit;
    } catch (error) {
      console.error('Failed to write audit log:', error);
      return null;
    }
  },

  async queryLogs(
    tenantId: string,
    filters: {
      action?: AuditAction;
      entity?: string;
      userId?: string;
      startDate?: Date;
      endDate?: Date;
      page?: number;
      limit?: number;
    }
  ) {
    const page = Math.max(1, Number(filters.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(filters.limit) || 20));
    const skip = (page - 1) * limit;

    const query: any = { tenantId: new mongoose.Types.ObjectId(tenantId) };

    if (filters.action) query.action = filters.action;
    if (filters.entity) query.entity = filters.entity;
    if (filters.userId && mongoose.Types.ObjectId.isValid(filters.userId)) {
      query.userId = new mongoose.Types.ObjectId(filters.userId);
    }
    if (filters.startDate || filters.endDate) {
      query.createdAt = {};
      if (filters.startDate) query.createdAt.$gte = filters.startDate;
      if (filters.endDate) query.createdAt.$lte = filters.endDate;
    }

    const [records, totalRecords] = await Promise.all([
      AuditLog.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      AuditLog.countDocuments(query),
    ]);

    const totalPages = Math.ceil(totalRecords / limit);

    return {
      records,
      pagination: {
        page,
        limit,
        totalRecords,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  },
};
