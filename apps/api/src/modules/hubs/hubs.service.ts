import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Hub } from './entities/hub.entity';
import { CreateHubDto } from './dto/create-hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class HubsService {
  constructor(
    @InjectRepository(Hub)
    private readonly hubRepo: Repository<Hub>,
  ) {}

  async findAll(pagination: PaginationDto, organizationId?: string) {
    const where: FindOptionsWhere<Hub> = {};
    if (organizationId) where.organizationId = organizationId;

    const [data, total] = await this.hubRepo.findAndCount({
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
    const hub = await this.hubRepo.findOne({ where: { id } });
    if (!hub) throw new NotFoundException('Hub not found');
    return hub;
  }

  async create(dto: CreateHubDto, organizationId: string) {
    const { lat, lng, ...rest } = dto;
    const hub = this.hubRepo.create({
      ...rest,
      organizationId,
      location: lat && lng
        ? () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)`
        : undefined,
    });
    return this.hubRepo.save(hub);
  }

  async update(id: string, dto: UpdateHubDto) {
    const hub = await this.findOne(id);
    const { lat, lng, ...rest } = dto;
    Object.assign(hub, rest);
    if (lat !== undefined && lng !== undefined) {
      hub.location = () => `ST_SetSRID(ST_MakePoint(${lng}, ${lat}), 4326)` as any;
    }
    return this.hubRepo.save(hub);
  }

  async remove(id: string) {
    const hub = await this.findOne(id);
    await this.hubRepo.softRemove(hub);
  }
}
