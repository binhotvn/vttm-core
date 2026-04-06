import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Organization } from './entities/organization.entity';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private readonly orgRepo: Repository<Organization>,
  ) {}

  async findAll(pagination: PaginationDto) {
    const [data, total] = await this.orgRepo.findAndCount({
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
    const org = await this.orgRepo.findOne({ where: { id } });
    if (!org) throw new NotFoundException('Organization not found');
    return org;
  }

  async create(dto: CreateOrganizationDto) {
    const org = this.orgRepo.create(dto);
    return this.orgRepo.save(org);
  }

  async update(id: string, dto: UpdateOrganizationDto) {
    const org = await this.findOne(id);
    Object.assign(org, dto);
    return this.orgRepo.save(org);
  }

  async remove(id: string) {
    const org = await this.findOne(id);
    await this.orgRepo.softRemove(org);
  }
}
