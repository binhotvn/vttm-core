import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { PickupStatus } from '@vttm/shared';
import { PickupService } from './pickup.service';
import { CreatePickupDto } from './dto/create-pickup.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';
import { UserRole } from '@vttm/shared';

@Controller('pickups')
export class PickupController {
  constructor(private readonly pickupService: PickupService) {}

  @Get('timeslots')
  @Public()
  getTimeSlots() { return this.pickupService.getTimeSlots(); }

  @Get()
  findAll(@Query(new ParsePaginationPipe()) p: PaginationDto, @Query('status') status: string, @CurrentUser() u: JwtPayload) {
    return this.pickupService.findAll(p, u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.pickupService.findOne(id); }

  @Post()
  create(@Body() dto: CreatePickupDto, @CurrentUser() u: JwtPayload) {
    return this.pickupService.create(dto, u.organizationId!, u.sub);
  }

  @Post(':id/assign')
  assign(@Param('id', ParseUUIDPipe) id: string, @Body() body: { driverId: string }) {
    return this.pickupService.assign(id, body.driverId);
  }

  @Post(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: PickupStatus }) {
    return this.pickupService.updateStatus(id, body.status);
  }

  @Post(':id/cancel')
  cancel(@Param('id', ParseUUIDPipe) id: string) { return this.pickupService.cancel(id); }
}
