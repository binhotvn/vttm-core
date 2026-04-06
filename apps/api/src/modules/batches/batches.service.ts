import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { BatchStatus, BatchType } from '@vttm/shared';
import { Batch } from './entities/batch.entity';
import { BatchShipment } from './entities/batch-shipment.entity';
import { Shipment } from '../shipments/entities/shipment.entity';
import { CreateBatchDto, SealBatchDto, SplitBatchDto } from './dto/create-batch.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class BatchesService {
  constructor(
    @InjectRepository(Batch)
    private readonly batchRepo: Repository<Batch>,
    @InjectRepository(BatchShipment)
    private readonly batchShipmentRepo: Repository<BatchShipment>,
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
  ) {}

  private async generateBatchNumber(type: BatchType): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const count = await this.batchRepo.count();
    return `BATCH-${date}-${type.slice(0, 3)}-${String(count + 1).padStart(3, '0')}`;
  }

  async findAll(pagination: PaginationDto, organizationId?: string, status?: string) {
    const qb = this.batchRepo.createQueryBuilder('b')
      .leftJoinAndSelect('b.batchShipments', 'bs')
      .orderBy(`b.${pagination.sortBy || 'createdAt'}`, pagination.sortOrder || 'DESC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (organizationId) qb.andWhere('b.organizationId = :orgId', { orgId: organizationId });
    if (status) qb.andWhere('b.status = :status', { status });

    const [data, total] = await qb.getManyAndCount();
    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findOne(id: string) {
    const batch = await this.batchRepo.findOne({
      where: { id },
      relations: ['batchShipments', 'batchShipments.shipment'],
    });
    if (!batch) throw new NotFoundException('Batch not found');
    return batch;
  }

  async create(dto: CreateBatchDto, organizationId: string) {
    const batchNumber = await this.generateBatchNumber(dto.type);
    const batch = this.batchRepo.create({
      batchNumber,
      organizationId,
      type: dto.type,
      originHubId: dto.originHubId,
      destinationHubId: dto.destinationHubId,
      notes: dto.notes,
    });
    const saved = await this.batchRepo.save(batch);

    if (dto.shipmentIds?.length) {
      await this.addShipments(saved.id, dto.shipmentIds);
    }

    return this.findOne(saved.id);
  }

  async addShipments(batchId: string, shipmentIds: string[], scannedById?: string) {
    const batch = await this.findOne(batchId);
    if (batch.status === BatchStatus.SEALED) {
      throw new BadRequestException('Cannot add shipments to a sealed batch');
    }

    const shipments = await this.shipmentRepo.find({ where: { id: In(shipmentIds) } });

    for (const shipment of shipments) {
      const existing = await this.batchShipmentRepo.findOne({
        where: { batchId, shipmentId: shipment.id },
      });
      if (!existing) {
        const bs = new BatchShipment();
        bs.batchId = batchId;
        bs.shipmentId = shipment.id;
        bs.scannedInAt = new Date();
        bs.scannedById = scannedById as any;
        bs.sortOrder = batch.shipmentCount + 1;
        await this.batchShipmentRepo.save(bs);

        // Update shipment's batchId
        shipment.batchId = batchId;
        await this.shipmentRepo.save(shipment);
      }
    }

    await this.recalculateBatchStats(batchId);
    return this.findOne(batchId);
  }

  async removeShipment(batchId: string, shipmentId: string) {
    const batch = await this.findOne(batchId);
    if (batch.status === BatchStatus.SEALED) {
      throw new BadRequestException('Cannot remove shipments from a sealed batch');
    }

    await this.batchShipmentRepo.delete({ batchId, shipmentId });

    const shipment = await this.shipmentRepo.findOne({ where: { id: shipmentId } });
    if (shipment) {
      shipment.batchId = null as any;
      await this.shipmentRepo.save(shipment);
    }

    await this.recalculateBatchStats(batchId);
    return this.findOne(batchId);
  }

  async seal(batchId: string, dto: SealBatchDto) {
    const batch = await this.findOne(batchId);
    if (batch.status !== BatchStatus.OPEN && batch.status !== BatchStatus.LOCKED) {
      throw new BadRequestException('Batch must be OPEN or LOCKED to seal');
    }
    if (batch.shipmentCount === 0) {
      throw new BadRequestException('Cannot seal an empty batch');
    }

    batch.status = BatchStatus.SEALED;
    batch.sealNumber = dto.sealNumber;
    batch.sealedAt = new Date();
    return this.batchRepo.save(batch);
  }

  async split(batchId: string, dto: SplitBatchDto, organizationId: string): Promise<Batch[]> {
    const batch = await this.findOne(batchId);
    if (batch.status === BatchStatus.SEALED) {
      throw new BadRequestException('Cannot split a sealed batch');
    }

    const shipmentIds = batch.batchShipments.map((bs) => bs.shipmentId);
    const shipments = await this.shipmentRepo.find({ where: { id: In(shipmentIds) } });

    let groups: Map<string, Shipment[]>;

    switch (dto.strategy) {
      case 'DISTRICT':
        groups = new Map();
        for (const s of shipments) {
          const district = s.recipientAddress?.districtName || 'unknown';
          if (!groups.has(district)) groups.set(district, []);
          groups.get(district)!.push(s);
        }
        break;

      case 'CAPACITY':
        groups = new Map();
        let currentGroup = 1;
        let currentWeight = 0;
        const maxWeight = dto.maxWeightKg || 30;
        for (const s of shipments) {
          if (currentWeight + Number(s.weightKg) > maxWeight) {
            currentGroup++;
            currentWeight = 0;
          }
          const key = `group-${currentGroup}`;
          if (!groups.has(key)) groups.set(key, []);
          groups.get(key)!.push(s);
          currentWeight += Number(s.weightKg);
        }
        break;

      case 'SERVICE_TYPE':
        groups = new Map();
        for (const s of shipments) {
          const st = s.serviceType;
          if (!groups.has(st)) groups.set(st, []);
          groups.get(st)!.push(s);
        }
        break;

      default:
        throw new BadRequestException(`Unsupported split strategy: ${dto.strategy}`);
    }

    const newBatches: Batch[] = [];
    for (const [, groupShipments] of groups) {
      if (groupShipments.length === 0) continue;
      const newBatch = await this.create(
        {
          type: batch.type,
          originHubId: batch.originHubId,
          destinationHubId: batch.destinationHubId,
          shipmentIds: groupShipments.map((s) => s.id),
        },
        organizationId,
      );
      newBatches.push(newBatch);
    }

    // Mark original batch as completed
    batch.status = BatchStatus.COMPLETED;
    await this.batchRepo.save(batch);

    return newBatches;
  }

  async merge(batchIds: string[], organizationId: string) {
    const batches = await this.batchRepo.find({ where: { id: In(batchIds) } });
    if (batches.length < 2) throw new BadRequestException('Need at least 2 batches to merge');

    for (const b of batches) {
      if (b.status === BatchStatus.SEALED) {
        throw new BadRequestException(`Batch ${b.batchNumber} is sealed`);
      }
    }

    // Collect all shipment IDs
    const allShipmentIds: string[] = [];
    for (const b of batches) {
      const batchShipments = await this.batchShipmentRepo.find({ where: { batchId: b.id } });
      allShipmentIds.push(...batchShipments.map((bs) => bs.shipmentId));
    }

    // Create merged batch
    const merged = await this.create(
      {
        type: batches[0].type,
        originHubId: batches[0].originHubId,
        destinationHubId: batches[0].destinationHubId,
        shipmentIds: allShipmentIds,
      },
      organizationId,
    );

    // Mark old batches as completed
    for (const b of batches) {
      b.status = BatchStatus.COMPLETED;
      await this.batchRepo.save(b);
    }

    return merged;
  }

  async scanIn(batchId: string, shipmentId: string, scannedById?: string) {
    const bs = await this.batchShipmentRepo.findOne({ where: { batchId, shipmentId } });
    if (!bs) throw new NotFoundException('Shipment not in this batch');
    bs.scannedInAt = new Date();
    bs.scannedById = scannedById as any;
    return this.batchShipmentRepo.save(bs);
  }

  async scanOut(batchId: string, shipmentId: string) {
    const bs = await this.batchShipmentRepo.findOne({ where: { batchId, shipmentId } });
    if (!bs) throw new NotFoundException('Shipment not in this batch');
    bs.scannedOutAt = new Date();
    return this.batchShipmentRepo.save(bs);
  }

  private async recalculateBatchStats(batchId: string) {
    const batchShipments = await this.batchShipmentRepo.find({
      where: { batchId },
      relations: ['shipment'],
    });

    const shipmentCount = batchShipments.length;
    const totalWeightKg = batchShipments.reduce((sum, bs) => sum + Number(bs.shipment?.weightKg || 0), 0);
    const totalCodAmount = batchShipments.reduce((sum, bs) => sum + Number(bs.shipment?.codAmount || 0), 0);

    await this.batchRepo.update(batchId, { shipmentCount, totalWeightKg, totalCodAmount });
  }

  async remove(id: string) {
    const batch = await this.findOne(id);
    await this.batchRepo.remove(batch);
  }
}
