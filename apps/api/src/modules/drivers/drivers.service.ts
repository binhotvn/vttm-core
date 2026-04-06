import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere, In } from 'typeorm';
import { DriverStatus } from '@vttm/shared';
import { Driver } from './entities/driver.entity';
import { CreateDriverDto, UpdateDriverDto, UpdateLocationDto } from './dto/create-driver.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

export type AssignmentStrategy = 'NEAREST' | 'LOAD_BALANCED' | 'ZONE_BASED' | 'CAPACITY' | 'PERFORMANCE';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}

  async findAll(pagination: PaginationDto, organizationId?: string, status?: string) {
    const where: FindOptionsWhere<Driver> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as DriverStatus;

    const [data, total] = await this.driverRepo.findAndCount({
      where,
      relations: ['user', 'homeHub'],
      order: { [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
    });

    return {
      data,
      meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) },
    };
  }

  async findOne(id: string) {
    const driver = await this.driverRepo.findOne({ where: { id }, relations: ['user', 'homeHub'] });
    if (!driver) throw new NotFoundException('Driver not found');
    return driver;
  }

  async findAvailable(organizationId: string) {
    return this.driverRepo.find({
      where: {
        organizationId,
        status: In([DriverStatus.AVAILABLE, DriverStatus.ON_DUTY]),
      },
      relations: ['user', 'homeHub'],
    });
  }

  async create(dto: CreateDriverDto, organizationId: string) {
    const driver = this.driverRepo.create({ ...dto, organizationId });
    return this.driverRepo.save(driver);
  }

  async update(id: string, dto: UpdateDriverDto) {
    const driver = await this.findOne(id);
    Object.assign(driver, dto);
    return this.driverRepo.save(driver);
  }

  async updateLocation(id: string, dto: UpdateLocationDto) {
    const driver = await this.findOne(id);
    driver.currentLocation = { lat: dto.lat, lng: dto.lng, updatedAt: new Date().toISOString() };
    return this.driverRepo.save(driver);
  }

  async updateStatus(id: string, status: DriverStatus) {
    const driver = await this.findOne(id);
    driver.status = status;
    return this.driverRepo.save(driver);
  }

  /**
   * Assignment engine: find the best driver for a set of shipments.
   * Filters by availability, hub, zone, capacity, schedule.
   * Ranks by chosen strategy.
   */
  async findBestDriver(
    organizationId: string,
    opts: {
      hubId?: string;
      targetLat?: number;
      targetLng?: number;
      totalWeightKg?: number;
      districtCodes?: string[];
      strategy?: AssignmentStrategy;
    },
  ): Promise<Driver | null> {
    let drivers = await this.findAvailable(organizationId);

    // Filter by hub
    if (opts.hubId) {
      drivers = drivers.filter((d) => d.homeHubId === opts.hubId);
    }

    // Filter by zone/district
    if (opts.districtCodes?.length) {
      drivers = drivers.filter((d) => {
        const zones = d.capabilities?.deliveryZones || [];
        return opts.districtCodes!.some((dc) => zones.includes(dc));
      });
    }

    // Filter by capacity
    if (opts.totalWeightKg) {
      drivers = drivers.filter((d) => {
        const max = d.capabilities?.maxWeightKg || 30;
        return max >= opts.totalWeightKg!;
      });
    }

    // Filter by schedule (today is a work day)
    const today = new Date().getDay();
    drivers = drivers.filter((d) => {
      if (!d.schedule?.workDays) return true;
      return d.schedule.workDays.includes(today);
    });

    if (drivers.length === 0) return null;

    const strategy = opts.strategy || 'NEAREST';

    // Score and rank
    const scored = drivers.map((d) => {
      let score = 0;

      if (strategy === 'NEAREST' || strategy === 'ZONE_BASED') {
        if (opts.targetLat && opts.targetLng && d.currentLocation) {
          const dist = this.haversineDistance(
            d.currentLocation.lat, d.currentLocation.lng,
            opts.targetLat, opts.targetLng,
          );
          score = 1 / (1 + dist); // Higher score for closer
        }
      }

      if (strategy === 'LOAD_BALANCED') {
        const todayCount = d.performanceMetrics?.todayDeliveries || 0;
        score = 1 / (1 + todayCount);
      }

      if (strategy === 'CAPACITY') {
        const max = d.capabilities?.maxWeightKg || 30;
        score = max;
      }

      if (strategy === 'PERFORMANCE') {
        score = d.performanceMetrics?.successRate || 0.5;
      }

      return { driver: d, score };
    });

    scored.sort((a, b) => b.score - a.score);
    return scored[0]?.driver || null;
  }

  private haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }
}
