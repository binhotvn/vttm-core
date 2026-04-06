import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
  ) {}

  async findAll(pagination: PaginationDto, organizationId?: string) {
    const where: FindOptionsWhere<User> = {};
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const [data, total] = await this.userRepo.findAndCount({
      where,
      order: { [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      relations: ['organization'],
    });

    return {
      data: data.map(({ passwordHash, ...user }) => user),
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.userRepo.findOne({
      where: { id },
      relations: ['organization'],
    });
    if (!user) throw new NotFoundException('User not found');
    const { passwordHash, ...result } = user;
    return result;
  }

  async create(dto: CreateUserDto) {
    const passwordHash = await bcrypt.hash(dto.password, 12);
    const { password, ...rest } = dto;
    const user = this.userRepo.create({ ...rest, passwordHash });
    const saved = await this.userRepo.save(user);
    const { passwordHash: _, ...result } = saved;
    return result;
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    Object.assign(user, dto);
    const saved = await this.userRepo.save(user);
    const { passwordHash, ...result } = saved;
    return result;
  }

  async remove(id: string) {
    const user = await this.userRepo.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    await this.userRepo.softRemove(user);
  }
}
