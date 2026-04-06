import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Get()
  findAll(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @Query('status') status: string,
    @CurrentUser() user: JwtPayload,
  ) {
    const orgId = user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId ?? undefined;
    return this.ordersService.findAll(pagination, orgId, status);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrderDto, @CurrentUser() user: JwtPayload) {
    return this.ordersService.create(dto, user.organizationId!, user.sub);
  }

  @Post('bulk')
  @Roles(UserRole.ORG_ADMIN)
  createBulk(@Body() dtos: CreateOrderDto[], @CurrentUser() user: JwtPayload) {
    return this.ordersService.createBulk(dtos, user.organizationId!, user.sub);
  }

  @Post(':id/confirm')
  confirm(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.confirm(id);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrderDto) {
    return this.ordersService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.ordersService.remove(id);
  }
}
