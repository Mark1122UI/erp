import mongoose from 'mongoose';
import {
  Notification,
  INotification,
  NotificationChannel,
  NotificationType,
} from './notification.model.js';
import { NotFoundError, BadRequestError } from '../common/errors.js';

export interface SendNotificationDTO {
  tenantId: string;
  userId: string;
  title: string;
  message: string;
  type?: NotificationType;
  channel?: NotificationChannel;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

// Extensible Channel Provider Interface
export interface INotificationChannelProvider {
  channel: NotificationChannel;
  send(notification: INotification): Promise<boolean>;
}

// Default In-App Channel Provider
class InAppChannelProvider implements INotificationChannelProvider {
  channel: NotificationChannel = 'IN_APP';
  async send(_notification: INotification): Promise<boolean> {
    // In-app notifications are stored directly in MongoDB for client querying
    return true;
  }
}

// Extensible External Channel Providers (Ready for Twilio, SendGrid, WhatsApp API, WebPush)
class EmailChannelProvider implements INotificationChannelProvider {
  channel: NotificationChannel = 'EMAIL';
  async send(_notification: INotification): Promise<boolean> {
    // E.g. SendGrid / Resend / AWS SES integration
    return true;
  }
}

class SMSChannelProvider implements INotificationChannelProvider {
  channel: NotificationChannel = 'SMS';
  async send(_notification: INotification): Promise<boolean> {
    // E.g. Twilio / MessageBird integration
    return true;
  }
}

class WhatsAppChannelProvider implements INotificationChannelProvider {
  channel: NotificationChannel = 'WHATSAPP';
  async send(_notification: INotification): Promise<boolean> {
    // E.g. WhatsApp Cloud API integration
    return true;
  }
}

class PushChannelProvider implements INotificationChannelProvider {
  channel: NotificationChannel = 'PUSH';
  async send(_notification: INotification): Promise<boolean> {
    // E.g. WebPush / Firebase Cloud Messaging (FCM) integration
    return true;
  }
}

export class NotificationService {
  private providers = new Map<NotificationChannel, INotificationChannelProvider>();

  constructor() {
    this.registerProvider(new InAppChannelProvider());
    this.registerProvider(new EmailChannelProvider());
    this.registerProvider(new SMSChannelProvider());
    this.registerProvider(new WhatsAppChannelProvider());
    this.registerProvider(new PushChannelProvider());
  }

  registerProvider(provider: INotificationChannelProvider) {
    this.providers.set(provider.channel, provider);
  }

  async send(data: SendNotificationDTO): Promise<INotification> {
    const channel = data.channel || 'IN_APP';

    const notification = await Notification.create({
      tenantId: new mongoose.Types.ObjectId(data.tenantId),
      userId: new mongoose.Types.ObjectId(data.userId),
      title: data.title.trim(),
      message: data.message.trim(),
      type: data.type || 'INFO',
      channel,
      isRead: false,
      actionUrl: data.actionUrl,
      metadata: data.metadata,
    });

    const provider = this.providers.get(channel);
    if (provider) {
      try {
        await provider.send(notification);
      } catch (err) {
        console.warn(`Failed to dispatch ${channel} notification:`, err);
      }
    }

    return notification;
  }

  async listUserNotifications(
    tenantId: string,
    userId: string,
    options: { unreadOnly?: boolean; limit?: number } = {}
  ): Promise<{ notifications: INotification[]; unreadCount: number }> {
    const query: any = {
      tenantId: new mongoose.Types.ObjectId(tenantId),
      userId: new mongoose.Types.ObjectId(userId),
      channel: 'IN_APP',
    };

    if (options.unreadOnly) {
      query.isRead = false;
    }

    const limit = Math.min(100, options.limit || 50);

    const [notifications, unreadCount] = await Promise.all([
      Notification.find(query).sort({ createdAt: -1 }).limit(limit).lean(),
      Notification.countDocuments({
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: new mongoose.Types.ObjectId(userId),
        channel: 'IN_APP',
        isRead: false,
      }),
    ]);

    return { notifications: notifications as any, unreadCount };
  }

  async markAsRead(tenantId: string, notificationId: string, userId: string): Promise<INotification> {
    if (!mongoose.Types.ObjectId.isValid(notificationId)) {
      throw new BadRequestError('Invalid notification ID');
    }

    const notification = await Notification.findOneAndUpdate(
      {
        _id: new mongoose.Types.ObjectId(notificationId),
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: new mongoose.Types.ObjectId(userId),
      },
      { isRead: true, readAt: new Date() },
      { new: true }
    );

    if (!notification) throw new NotFoundError('Notification not found');
    return notification;
  }

  async markAllAsRead(tenantId: string, userId: string): Promise<{ modifiedCount: number }> {
    const res = await Notification.updateMany(
      {
        tenantId: new mongoose.Types.ObjectId(tenantId),
        userId: new mongoose.Types.ObjectId(userId),
        isRead: false,
      },
      { isRead: true, readAt: new Date() }
    );

    return { modifiedCount: res.modifiedCount };
  }
}

export const notificationService = new NotificationService();
