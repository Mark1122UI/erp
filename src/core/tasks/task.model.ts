import mongoose, { Schema, Document } from 'mongoose';

export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type TaskEntityType =
  | 'CUSTOMER'
  | 'SUPPLIER'
  | 'SALE'
  | 'INVOICE'
  | 'PRODUCT'
  | 'PURCHASE_ORDER'
  | 'SUPPLIER_BILL';

export interface ITaskRelatedEntity {
  entityType: TaskEntityType;
  entityId: mongoose.Types.ObjectId;
  entityName?: string;
}

export interface ITask extends Document {
  tenantId: mongoose.Types.ObjectId;
  taskNumber: string; // e.g. 'TSK-00001'
  title: string;
  description?: string;
  assignedTo?: mongoose.Types.ObjectId;
  dueDate?: Date;
  priority: TaskPriority;
  status: TaskStatus;
  relatedEntity?: ITaskRelatedEntity;
  tags: string[];
  completedAt?: Date;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const TaskSchema = new Schema<ITask>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    taskNumber: { type: String, required: true, trim: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    assignedTo: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    dueDate: { type: Date, index: true },
    priority: {
      type: String,
      enum: ['LOW', 'MEDIUM', 'HIGH', 'URGENT'],
      default: 'MEDIUM',
      index: true,
    },
    status: {
      type: String,
      enum: ['TODO', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'],
      default: 'TODO',
      index: true,
    },
    relatedEntity: {
      entityType: {
        type: String,
        enum: ['CUSTOMER', 'SUPPLIER', 'SALE', 'INVOICE', 'PRODUCT', 'PURCHASE_ORDER', 'SUPPLIER_BILL'],
      },
      entityId: { type: Schema.Types.ObjectId },
      entityName: { type: String },
    },
    tags: [{ type: String, trim: true }],
    completedAt: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

TaskSchema.index({ tenantId: 1, taskNumber: 1 }, { unique: true });
TaskSchema.index({ tenantId: 1, status: 1, priority: 1, dueDate: 1 });
TaskSchema.index({ tenantId: 1, 'relatedEntity.entityType': 1, 'relatedEntity.entityId': 1 });

export const Task = mongoose.model<ITask>('Task', TaskSchema);
