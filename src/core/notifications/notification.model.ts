import mongoose, { Schema, Document } from 'mongoose';

export type NotificationChannel = 'IN_APP' | 'EMAIL' | 'SMS' | 'WHATSAPP' | 'PUSH';
export type NotificationType =
  | 'INFO'
  | 'SUCCESS'
  | 'WARNING'
  | 'ALERT'
  | 'TASK_ASSIGNED'
  | 'PAYMENT_DUE'
  | 'LOW_STOCK'
  | 'DOCUMENT_CREATED';

export interface INotification extends Document {
  tenantId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId; // Recipient
  title: string;
  message: string;
  type: NotificationType;
  channel: NotificationChannel;
  isRead: boolean;
  readAt?: Date;
  actionUrl?: string;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    tenantId: { type: Schema.Types.ObjectId, ref: 'Tenant', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: [
        'INFO',
        'SUCCESS',
        'WARNING',
        'ALERT',
        'TASK_ASSIGNED',
        'PAYMENT_DUE',
        'LOW_STOCK',
        'DOCUMENT_CREATED',
      ],
      default: 'INFO',
      index: true,
    },
    channel: {
      type: String,
      enum: ['IN_APP', 'EMAIL', 'SMS', 'WHATSAPP', 'PUSH'],
      default: 'IN_APP',
      index: true,
    },
    isRead: { type: Boolean, default: false, index: true },
    readAt: { type: Date },
    actionUrl: { type: String },
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

NotificationSchema.index({ tenantId: 1, userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
