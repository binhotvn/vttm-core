import { Controller, Get, Post, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { RoutesService } from './routes.service';
import { CreateRouteDto } from './dto/create-route.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('routes')
@Roles(UserRole.DISPATCHER)
export class RoutesController {
  constructor(private readonly routesService: RoutesService) {}

  @Get()
  findAll(@Query(new ParsePaginationPipe()) p: PaginationDto, @CurrentUser() u: JwtPayload) {
    return this.routesService.findAll(p, u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.routesService.findOne(id); }

  @Post()
  create(@Body() dto: CreateRouteDto, @CurrentUser() u: JwtPayload) {
    return this.routesService.create(dto, u.organizationId!);
  }

  @Post(':id/optimize')
  optimize(@Param('id', ParseUUIDPipe) id: string) { return this.routesService.optimize(id); }

  @Post(':id/start')
  start(@Param('id', ParseUUIDPipe) id: string) { return this.routesService.start(id); }

  @Post(':id/stops/:stopId/complete')
  completeStop(@Param('id', ParseUUIDPipe) id: string, @Param('stopId', ParseUUIDPipe) stopId: string) {
    return this.routesService.completeStop(id, stopId);
  }

  @Post(':id/complete')
  complete(@Param('id', ParseUUIDPipe) id: string) { return this.routesService.complete(id); }
}
