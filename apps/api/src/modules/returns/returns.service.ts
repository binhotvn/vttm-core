import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReturnStatus, ShipmentStatus } from '@vttm/shared';
import { ReturnRequest } from './entities/return-request.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateReturnDto } from './dto/create-return.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class ReturnsService {
  constructor(
    @InjectRepository(ReturnRequest)
    private readonly returnRepo: Repository<ReturnRequest>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async generateReturnNumber(): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const count = await this.returnRepo.count();
    return `RET-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(pagination: PaginationDto, organizationId?: string) {
    const qb = this.returnRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.originalShipment', 'os')
      .orderBy('r.createdAt', 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (organizationId) qb.andWhere('r.organizationId = :orgId', { orgId: organizationId });
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) } };
  }

  async findOne(id: string) {
    const ret = await this.returnRepo.findOne({ where: { id }, relations: ['originalShipment', 'returnShipment'] });
    if (!ret) throw new NotFoundException('Return request not found');
    return ret;
  }

  async create(dto: CreateReturnDto, organizationId: string) {
    const shipment = await this.shipmentRepo.findOne({ where: { id: dto.originalShipmentId } });
    if (!shipment) throw new NotFoundException('Original shipment not found');

    // Calculate return fee (50% of original shipping cost)
    const returnFee = Math.round(Number(shipment.shippingCost) * 0.5);

    const returnNumber = await this.generateReturnNumber();
    const returnRequest = this.returnRepo.create({
      returnNumber,
      organizationId,
      originalShipmentId: dto.originalShipmentId,
      reason: dto.reason,
      returnFee,
      notes: dto.notes,
      status: ReturnStatus.REQUESTED,
    });

    // Update original shipment status
    shipment.status = ShipmentStatus.RETURNED_TO_SENDER;
    await this.shipmentRepo.save(shipment);

    return this.returnRepo.save(returnRequest);
  }

  async approve(id: string) {
    const ret = await this.findOne(id);
    ret.status = ReturnStatus.APPROVED;
    return this.returnRepo.save(ret);
  }

  async updateStatus(id: string, status: ReturnStatus) {
    const ret = await this.findOne(id);
    ret.status = status;
    return this.returnRepo.save(ret);
  }
}
