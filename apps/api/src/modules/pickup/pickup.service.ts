import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { PickupStatus } from '@vttm/shared';
import { PickupRequest } from './entities/pickup-request.entity';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

const TIME_SLOTS = [
  { start: '08:00', end: '12:00', label: 'Sáng (8h-12h)' },
  { start: '13:00', end: '17:00', label: 'Chiều (13h-17h)' },
  { start: '17:00', end: '21:00', label: 'Tối (17h-21h)' },
];

@Injectable()
export class PickupService {
  constructor(
    @InjectRepository(PickupRequest)
    private readonly pickupRepo: Repository<PickupRequest>,
  ) {}

  private async generatePickupNumber(): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const count = await this.pickupRepo.count();
    return `PU-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  getTimeSlots() {
    return TIME_SLOTS;
  }

  async findAll(pagination: PaginationDto, organizationId?: string, status?: string) {
    const where: FindOptionsWhere<PickupRequest> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as PickupStatus;

    const [data, total] = await this.pickupRepo.findAndCount({
      where,
      order: { [pagination.sortBy || 'requestedDate']: pagination.sortOrder || 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });
    return { data, meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) } };
  }

  async findOne(id: string) {
    const pickup = await this.pickupRepo.findOne({ where: { id }, relations: ['assignedDriver'] });
    if (!pickup) throw new NotFoundException('Pickup request not found');
    return pickup;
  }

  async create(dto: CreatePickupDto, organizationId: string, customerId?: string) {
    const pickupNumber = await this.generatePickupNumber();
    const pickup = this.pickupRepo.create({
      pickupNumber,
      organizationId,
      customerId,
      pickupAddress: dto.pickupAddress,
      contactInfo: dto.contactInfo,
      requestedDate: new Date(dto.requestedDate),
      timeSlot: dto.timeSlot,
      estimatedPieceCount: dto.estimatedPieceCount || 0,
      estimatedWeightKg: dto.estimatedWeightKg || 0,
      specialInstructions: dto.specialInstructions,
      status: PickupStatus.REQUESTED,
    });
    return this.pickupRepo.save(pickup);
  }

  async assign(id: string, driverId: string) {
    const pickup = await this.findOne(id);
    pickup.assignedDriverId = driverId;
    pickup.status = PickupStatus.DRIVER_ASSIGNED;
    return this.pickupRepo.save(pickup);
  }

  async updateStatus(id: string, status: PickupStatus) {
    const pickup = await this.findOne(id);
    pickup.status = status;
    if (status === PickupStatus.COMPLETED) {
      pickup.confirmation = { confirmedAt: new Date().toISOString() } as any;
    }
    return this.pickupRepo.save(pickup);
  }

  async cancel(id: string) {
    const pickup = await this.findOne(id);
    if (pickup.status === PickupStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed pickup');
    }
    pickup.status = PickupStatus.CANCELLED;
    return this.pickupRepo.save(pickup);
  }
}
