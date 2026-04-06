import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Notification, NotificationChannel, NotificationStatus } from './entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private readonly notifRepo: Repository<Notification>,
  ) {}

  async findByUser(userId: string) {
    return this.notifRepo.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: 50,
    });
  }

  async markRead(id: string) {
    const notif = await this.notifRepo.findOne({ where: { id } });
    if (!notif) throw new NotFoundException('Notification not found');
    notif.status = NotificationStatus.READ;
    notif.readAt = new Date();
    return this.notifRepo.save(notif);
  }

  async markAllRead(userId: string) {
    await this.notifRepo.update(
      { userId, status: NotificationStatus.DELIVERED },
      { status: NotificationStatus.READ, readAt: new Date() },
    );
  }

  /**
   * Send a notification via the appropriate channel.
   * In production, this would queue to BullMQ and dispatch to SMS/Zalo/Push services.
   * For now, we just log and store the notification.
   */
  async send(opts: {
    organizationId?: string;
    userId?: string;
    channel: NotificationChannel;
    recipient: string;
    titleVi: string;
    titleEn?: string;
    bodyVi: string;
    bodyEn?: string;
    metadata?: Record<string, any>;
  }) {
    const notif = this.notifRepo.create({
      organizationId: opts.organizationId,
      userId: opts.userId,
      channel: opts.channel,
      recipient: opts.recipient,
      titleVi: opts.titleVi,
      titleEn: opts.titleEn,
      bodyVi: opts.bodyVi,
      bodyEn: opts.bodyEn,
      metadata: opts.metadata || {},
      status: NotificationStatus.SENT,
      sentAt: new Date(),
    });

    // In production: dispatch to SMS gateway (eSMS), Zalo OA API, Firebase, etc.
    console.log(`[NOTIFICATION] ${opts.channel} → ${opts.recipient}: ${opts.titleVi}`);

    return this.notifRepo.save(notif);
  }

  /**
   * Send shipment status notification to recipient.
   */
  async sendShipmentUpdate(
    trackingNumber: string,
    recipientPhone: string,
    statusVi: string,
    statusEn: string,
    organizationId?: string,
  ) {
    return this.send({
      organizationId,
      channel: NotificationChannel.SMS,
      recipient: recipientPhone,
      titleVi: `Cập nhật đơn hàng ${trackingNumber}`,
      titleEn: `Shipment update ${trackingNumber}`,
      bodyVi: `Đơn hàng ${trackingNumber}: ${statusVi}`,
      bodyEn: `Shipment ${trackingNumber}: ${statusEn}`,
      metadata: { trackingNumber },
    });
  }

  async getUnreadCount(userId: string) {
    return this.notifRepo.count({
      where: { userId, status: NotificationStatus.DELIVERED },
    });
  }
}
