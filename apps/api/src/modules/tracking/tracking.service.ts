import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { TrackingEvent } from './entities/tracking-event.entity';
import { SHIPMENT_STATUS_CONFIG } from '@vttm/shared';

@Injectable()
export class TrackingService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(TrackingEvent)
    private readonly trackingEventRepo: Repository<TrackingEvent>,
  ) {}

  async trackByNumber(trackingNumber: string, lang: string = 'vi') {
    const shipment = await this.shipmentRepo.findOne({
      where: { trackingNumber },
    });
    if (!shipment) {
      throw new NotFoundException('Shipment not found');
    }

    const events = await this.trackingEventRepo.find({
      where: { shipmentId: shipment.id, isPublic: true },
      order: { timestamp: 'DESC' },
    });

    const statusConfig = SHIPMENT_STATUS_CONFIG[shipment.status];

    return {
      trackingNumber: shipment.trackingNumber,
      status: shipment.status,
      statusLabel: lang === 'en' ? statusConfig.en : statusConfig.vi,
      statusColor: statusConfig.color,
      serviceType: shipment.serviceType,
      senderAddress: {
        provinceName: shipment.senderAddress?.provinceName,
        districtName: shipment.senderAddress?.districtName,
      },
      recipientAddress: {
        provinceName: shipment.recipientAddress?.provinceName,
        districtName: shipment.recipientAddress?.districtName,
      },
      estimatedDeliveryDate: shipment.estimatedDeliveryDate,
      actualDeliveryDate: shipment.actualDeliveryDate,
      events: events.map((e) => ({
        status: e.status,
        title: lang === 'en' ? e.titleEn : e.titleVi,
        description: lang === 'en' ? e.descriptionEn : e.descriptionVi,
        location: e.location,
        timestamp: e.timestamp,
      })),
    };
  }

  async trackMultiple(trackingNumbers: string[], lang: string = 'vi') {
    const results: Record<string, any> = {};
    for (const tn of trackingNumbers) {
      try {
        results[tn] = await this.trackByNumber(tn, lang);
      } catch {
        results[tn] = { error: 'Not found' };
      }
    }
    return results;
  }
}
