import mongoose, { Schema, Document } from 'mongoose';

export type AuditAction =
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'PAYMENT'
  | 'REFUND'
  | 'STOCK_ADJUSTMENT'
  | 'PERMISSION_CHANGE'
  | 'EXPORT';

export interface IAuditLog extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId?: mongoose.Types.ObjectId;
  userEmail?: string;
  action: AuditAction;
  entity: string;
  entityId?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    userEmail: { type: String },
    action: {
      type: String,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'LOGIN',
        'LOGOUT',
        'PAYMENT',
        'REFUND',
        'STOCK_ADJUSTMENT',
        'PERMISSION_CHANGE',
        'EXPORT',
      ],
      required: true,
      index: true,
    },
    entity: { type: String, required: true, index: true },
    entityId: { type: String, index: true },
    metadata: { type: Schema.Types.Mixed },
    ipAddress: { type: String },
    userAgent: { type: String },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

// Compound indexes for tenant-scoped time series queries
AuditLogSchema.index({ tenantId: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, action: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, entity: 1, createdAt: -1 });
AuditLogSchema.index({ tenantId: 1, entity: 1, entityId: 1 });
AuditLogSchema.index({ tenantId: 1, userId: 1, createdAt: -1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
