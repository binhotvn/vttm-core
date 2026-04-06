import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeliveryAttempt, DeliveryAttemptResult } from './entities/delivery-attempt.entity';

@Injectable()
export class DeliveryService {
  constructor(
    @InjectRepository(DeliveryAttempt)
    private readonly attemptRepo: Repository<DeliveryAttempt>,
  ) {}

  async findByShipment(shipmentId: string) {
    return this.attemptRepo.find({
      where: { shipmentId },
      order: { attemptNumber: 'ASC' },
    });
  }

  async recordAttempt(data: {
    shipmentId: string;
    attemptNumber: number;
    driverId?: string;
    result: DeliveryAttemptResult;
    failureReasonCode?: string;
    failureNotes?: string;
    photoUrls?: string[];
    geoLocation?: { lat: number; lng: number };
    rescheduledTo?: Date;
  }) {
    const attempt = this.attemptRepo.create({
      ...data,
      attemptedAt: new Date(),
    });
    return this.attemptRepo.save(attempt);
  }
}
