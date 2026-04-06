import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole, DriverStatus } from '@vttm/shared';
import { DriversService, AssignmentStrategy } from './drivers.service';
import { CreateDriverDto, UpdateDriverDto, UpdateLocationDto } from './dto/create-driver.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @Get()
  @Roles(UserRole.DISPATCHER)
  findAll(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const orgId = user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId ?? undefined;
    return this.driversService.findAll(pagination, orgId, status);
  }

  @Get('available')
  @Roles(UserRole.DISPATCHER)
  findAvailable(@CurrentUser() user: JwtPayload) {
    return this.driversService.findAvailable(user.organizationId!);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.driversService.findOne(id);
  }

  @Post()
  @Roles(UserRole.ORG_ADMIN)
  create(@Body() dto: CreateDriverDto, @CurrentUser() user: JwtPayload) {
    return this.driversService.create(dto, user.organizationId!);
  }

  @Patch(':id')
  @Roles(UserRole.DISPATCHER)
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateDriverDto) {
    return this.driversService.update(id, dto);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { status: DriverStatus },
  ) {
    return this.driversService.updateStatus(id, body.status);
  }

  @Patch(':id/location')
  updateLocation(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateLocationDto) {
    return this.driversService.updateLocation(id, dto);
  }

  @Get('assign/best')
  @Roles(UserRole.DISPATCHER)
  findBest(
    @Query('hubId') hubId: string,
    @Query('lat') lat: string,
    @Query('lng') lng: string,
    @Query('weightKg') weightKg: string,
    @Query('strategy') strategy: string,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.driversService.findBestDriver(user.organizationId!, {
      hubId,
      targetLat: lat ? parseFloat(lat) : undefined,
      targetLng: lng ? parseFloat(lng) : undefined,
      totalWeightKg: weightKg ? parseFloat(weightKg) : undefined,
      strategy: (strategy as AssignmentStrategy) || 'NEAREST',
    });
  }
}
