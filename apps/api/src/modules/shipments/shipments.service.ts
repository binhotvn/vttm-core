import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, DataSource } from 'typeorm';
import { ShipmentStatus, isValidTransition, SHIPMENT_STATUS_CONFIG, buildTrackingNumber } from '@vttm/shared';
import { Shipment } from './entities/shipment.entity';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';
import { TrackingEvent } from '../tracking/entities/tracking-event.entity';

@Injectable()
export class ShipmentsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(TrackingEvent)
    private readonly trackingEventRepo: Repository<TrackingEvent>,
    private readonly dataSource: DataSource,
  ) {}

  private async generateTrackingNumber(orgPrefix: string = 'NW'): Promise<string> {
    const today = new Date();
    const dateKey = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}${String(today.getDate()).padStart(2, '0')}`;

    // Use a simple count for sequence (in production, use Redis INCR)
    const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const count = await this.shipmentRepo
      .createQueryBuilder('s')
      .where('s."createdAt" >= :start', { start: todayStart })
      .getCount();

    return buildTrackingNumber(orgPrefix, today, count + 1);
  }

  async findAll(pagination: PaginationDto, organizationId?: string, status?: string) {
    const where: FindOptionsWhere<Shipment> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as ShipmentStatus;

    const [data, total] = await this.shipmentRepo.findAndCount({
      where,
      order: { [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: string) {
    const shipment = await this.shipmentRepo.findOne({ where: { id } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async findByTrackingNumber(trackingNumber: string) {
    const shipment = await this.shipmentRepo.findOne({ where: { trackingNumber } });
    if (!shipment) throw new NotFoundException('Shipment not found');
    return shipment;
  }

  async create(dto: CreateShipmentDto, organizationId: string) {
    const trackingNumber = await this.generateTrackingNumber();

    // Calculate volumetric weight if dimensions provided
    let volumetricWeightKg: number | undefined;
    if (dto.dimensions) {
      const { lengthCm, widthCm, heightCm } = dto.dimensions;
      volumetricWeightKg = (lengthCm * widthCm * heightCm) / 6000;
    }

    // Calculate COD fee
    const codAmount = dto.codAmount || 0;
    const codFee = codAmount > 0 ? Math.max(Math.round(codAmount * 0.015), 10000) : 0;

    const shipment = this.shipmentRepo.create({
      trackingNumber,
      barcode: trackingNumber,
      orderId: dto.orderId,
      organizationId,
      senderAddress: dto.senderAddress,
      recipientAddress: dto.recipientAddress,
      weightKg: dto.weightKg || 0,
      volumetricWeightKg,
      dimensions: dto.dimensions,
      pieceCount: dto.pieceCount || 1,
      serviceType: dto.serviceType,
      codAmount,
      codFee,
      shippingCost: dto.shippingCost || 0,
      status: ShipmentStatus.LABEL_CREATED,
    });

    const saved = await this.shipmentRepo.save(shipment);

    // Create initial tracking event
    await this.createTrackingEvent(saved, ShipmentStatus.LABEL_CREATED, {
      location: 'System',
    });

    return saved;
  }

  async updateStatus(id: string, dto: UpdateShipmentStatusDto, performedById?: string) {
    const shipment = await this.findOne(id);
    const oldStatus = shipment.status;
    const newStatus = dto.status;

    if (!isValidTransition(oldStatus, newStatus)) {
      throw new BadRequestException(
        `Cannot transition from ${oldStatus} to ${newStatus}`,
      );
    }

    shipment.previousStatus = oldStatus;
    shipment.status = newStatus;

    // Set timestamps for key states
    if (newStatus === ShipmentStatus.PICKED_UP) {
      shipment.pickedUpAt = new Date();
    } else if (newStatus === ShipmentStatus.DELIVERED) {
      shipment.actualDeliveryDate = new Date();
    } else if (newStatus === ShipmentStatus.DELIVERY_ATTEMPTED) {
      shipment.deliveryAttempts += 1;
    } else if (newStatus === ShipmentStatus.EXCEPTION) {
      shipment.exceptionReason = dto.reason as any;
    }

    // Update hub if provided
    if (dto.hubId) {
      shipment.currentHubId = dto.hubId;
    }

    const saved = await this.shipmentRepo.save(shipment);

    // Create tracking event
    await this.createTrackingEvent(saved, newStatus, {
      location: dto.location,
      geoLocation: dto.geoLocation,
      hubId: dto.hubId,
      performedById,
      reason: dto.reason,
    });

    return saved;
  }

  async batchUpdateStatus(shipmentIds: string[], status: ShipmentStatus, hubId?: string, performedById?: string) {
    const results: { updated: string[]; errors: { id: string; error: string }[] } = {
      updated: [],
      errors: [],
    };

    for (const id of shipmentIds) {
      try {
        await this.updateStatus(id, { status, hubId }, performedById);
        results.updated.push(id);
      } catch (err: any) {
        results.errors.push({ id, error: err.message });
      }
    }

    return results;
  }

  private async createTrackingEvent(
    shipment: Shipment,
    status: ShipmentStatus,
    opts: {
      location?: string;
      geoLocation?: { lat: number; lng: number };
      hubId?: string;
      performedById?: string;
      reason?: string;
    },
  ) {
    const config = SHIPMENT_STATUS_CONFIG[status];
    const event = new TrackingEvent();
    event.shipmentId = shipment.id;
    event.status = status;
    event.titleVi = config.vi;
    event.titleEn = config.en;
    event.descriptionVi = opts.reason as any;
    event.descriptionEn = opts.reason as any;
    event.location = opts.location as any;
    event.geoLocation = opts.geoLocation as any;
    event.hubId = opts.hubId as any;
    event.performedById = opts.performedById as any;
    event.timestamp = new Date();
    event.isPublic = true;
    return this.trackingEventRepo.save(event);
  }

  async remove(id: string) {
    const shipment = await this.findOne(id);
    await this.shipmentRepo.softRemove(shipment);
  }
}
