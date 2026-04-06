import { Controller, Get, Post, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { BatchesService } from './batches.service';
import { CreateBatchDto, SealBatchDto, SplitBatchDto } from './dto/create-batch.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('batches')
@Roles(UserRole.WAREHOUSE)
export class BatchesController {
  constructor(private readonly batchesService: BatchesService) {}

  @Get()
  findAll(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const orgId = user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId ?? undefined;
    return this.batchesService.findAll(pagination, orgId, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateBatchDto, @CurrentUser() user: JwtPayload) {
    return this.batchesService.create(dto, user.organizationId!);
  }

  @Post(':id/shipments')
  addShipments(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { shipmentIds: string[] },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.batchesService.addShipments(id, body.shipmentIds, user.sub);
  }

  @Delete(':id/shipments/:shipmentId')
  removeShipment(
    @Param('id', ParseUUIDPipe) id: string,
    @Param('shipmentId', ParseUUIDPipe) shipmentId: string,
  ) {
    return this.batchesService.removeShipment(id, shipmentId);
  }

  @Post(':id/seal')
  seal(@Param('id', ParseUUIDPipe) id: string, @Body() dto: SealBatchDto) {
    return this.batchesService.seal(id, dto);
  }

  @Post(':id/split')
  split(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: SplitBatchDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.batchesService.split(id, dto, user.organizationId!);
  }

  @Post('merge')
  merge(@Body() body: { batchIds: string[] }, @CurrentUser() user: JwtPayload) {
    return this.batchesService.merge(body.batchIds, user.organizationId!);
  }

  @Post(':id/scan-in')
  scanIn(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { shipmentId: string },
    @CurrentUser() user: JwtPayload,
  ) {
    return this.batchesService.scanIn(id, body.shipmentId, user.sub);
  }

  @Post(':id/scan-out')
  scanOut(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() body: { shipmentId: string },
  ) {
    return this.batchesService.scanOut(id, body.shipmentId);
  }

  @Delete(':id')
  @Roles(UserRole.ORG_ADMIN)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.batchesService.remove(id);
  }
}
