import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole, ShipmentStatus } from '@vttm/shared';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentStatusDto } from './dto/update-shipment-status.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('shipments')
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) {}

  @Get()
  findAll(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const orgId = user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId ?? undefined;
    return this.shipmentsService.findAll(pagination, orgId, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateShipmentDto, @CurrentUser() user: JwtPayload) {
    return this.shipmentsService.create(dto, user.organizationId!);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateShipmentStatusDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.shipmentsService.updateStatus(id, dto, user.sub);
  }

  @Post('batch-status')
  @Roles(UserRole.WAREHOUSE)
  batchUpdateStatus(
    @Body() body: { shipmentIds: string[]; status: ShipmentStatus; hubId?: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.shipmentsService.batchUpdateStatus(
      body.shipmentIds, body.status, body.hubId, user.sub,
    );
  }

  @Delete(':id')
  @Roles(UserRole.ORG_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.shipmentsService.remove(id);
  }
}
