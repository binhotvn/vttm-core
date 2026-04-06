import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RouteStatus, StopStatus } from '@vttm/shared';
import { Route } from './entities/route.entity';
import { RouteStop } from './entities/route-stop.entity';
import { CreateRouteDto } from './dto/create-route.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';

@Injectable()
export class RoutesService {
  constructor(
    @InjectRepository(Route)
    private readonly routeRepo: Repository<Route>,
    @InjectRepository(RouteStop)
    private readonly stopRepo: Repository<RouteStop>,
  ) {}

  private async generateRouteNumber(): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const count = await this.routeRepo.count();
    return `RT-${date}-${String(count + 1).padStart(4, '0')}`;
  }

  async findAll(pagination: PaginationDto, organizationId?: string) {
    const qb = this.routeRepo.createQueryBuilder('r')
      .leftJoinAndSelect('r.stops', 's')
      .orderBy('r.createdAt', 'DESC')
      .addOrderBy('s.sequenceNumber', 'ASC')
      .skip((pagination.page - 1) * pagination.limit)
      .take(pagination.limit);

    if (organizationId) qb.andWhere('r.organizationId = :orgId', { orgId: organizationId });
    const [data, total] = await qb.getManyAndCount();
    return { data, meta: { total, page: pagination.page, limit: pagination.limit, totalPages: Math.ceil(total / pagination.limit) } };
  }

  async findOne(id: string) {
    const route = await this.routeRepo.findOne({ where: { id }, relations: ['stops', 'driver'] });
    if (!route) throw new NotFoundException('Route not found');
    return route;
  }

  async create(dto: CreateRouteDto, organizationId: string) {
    const routeNumber = await this.generateRouteNumber();
    const route = this.routeRepo.create({
      routeNumber,
      organizationId,
      driverId: dto.driverId,
      startHubId: dto.startHubId,
      plannedStartTime: dto.plannedStartTime ? new Date(dto.plannedStartTime) : undefined,
      stops: dto.stops.map((s, i) => {
        const stop = new RouteStop();
        stop.sequenceNumber = i + 1;
        stop.type = s.type;
        stop.shipmentId = s.shipmentId as any;
        stop.address = s.address;
        stop.geoLocation = s.geoLocation as any;
        stop.notes = s.notes as any;
        return stop;
      }),
    });

    const saved = await this.routeRepo.save(route);
    return this.findOne(saved.id);
  }

  /**
   * Nearest-neighbor TSP optimization.
   * Reorders stops to minimize total travel distance.
   */
  async optimize(routeId: string) {
    const route = await this.findOne(routeId);
    const stops = route.stops.filter((s) => s.geoLocation);

    if (stops.length < 2) return route;

    // Nearest-neighbor heuristic
    const optimized: RouteStop[] = [];
    const remaining = [...stops];
    let current = remaining.shift()!;
    optimized.push(current);

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let nearestDist = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const dist = this.haversine(
          current.geoLocation!.lat, current.geoLocation!.lng,
          remaining[i].geoLocation!.lat, remaining[i].geoLocation!.lng,
        );
        if (dist < nearestDist) {
          nearestDist = dist;
          nearestIdx = i;
        }
      }

      current = remaining.splice(nearestIdx, 1)[0];
      optimized.push(current);
    }

    // Update sequence numbers and calculate totals
    let totalDistance = 0;
    for (let i = 0; i < optimized.length; i++) {
      optimized[i].sequenceNumber = i + 1;
      if (i > 0) {
        totalDistance += this.haversine(
          optimized[i - 1].geoLocation!.lat, optimized[i - 1].geoLocation!.lng,
          optimized[i].geoLocation!.lat, optimized[i].geoLocation!.lng,
        );
      }
      await this.stopRepo.save(optimized[i]);
    }

    route.totalDistanceKm = Math.round(totalDistance * 100) / 100;
    route.estimatedDurationMinutes = Math.round((totalDistance / 25) * 60); // ~25 km/h avg in city
    route.status = RouteStatus.OPTIMIZED;
    await this.routeRepo.save(route);

    return this.findOne(routeId);
  }

  async start(routeId: string) {
    const route = await this.findOne(routeId);
    route.status = RouteStatus.IN_PROGRESS;
    route.actualStartTime = new Date();
    return this.routeRepo.save(route);
  }

  async completeStop(routeId: string, stopId: string) {
    const stop = await this.stopRepo.findOne({ where: { id: stopId, routeId } });
    if (!stop) throw new NotFoundException('Stop not found');
    stop.status = StopStatus.COMPLETED;
    stop.completedAt = new Date();
    await this.stopRepo.save(stop);

    // Check if all stops complete
    const route = await this.findOne(routeId);
    const allDone = route.stops.every((s) => s.status === StopStatus.COMPLETED || s.status === StopStatus.SKIPPED);
    if (allDone) {
      route.status = RouteStatus.COMPLETED;
      route.completedAt = new Date();
      await this.routeRepo.save(route);
    }

    return route;
  }

  async complete(routeId: string) {
    const route = await this.findOne(routeId);
    route.status = RouteStatus.COMPLETED;
    route.completedAt = new Date();
    return this.routeRepo.save(route);
  }

  private haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLng = ((lng2 - lng1) * Math.PI) / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }
}
