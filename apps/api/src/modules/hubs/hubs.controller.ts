import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { HubsService } from './hubs.service';
import { CreateHubDto } from './dto/create-hub.dto';
import { UpdateHubDto } from './dto/update-hub.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('hubs')
@Roles(UserRole.ORG_ADMIN)
export class HubsController {
  constructor(private readonly hubsService: HubsService) {}

  @Get()
  findAll(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const orgId = user.role === UserRole.SUPER_ADMIN ? undefined : user.organizationId ?? undefined;
    return this.hubsService.findAll(pagination, orgId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hubsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateHubDto, @CurrentUser() user: JwtPayload) {
    const orgId = user.organizationId!;
    return this.hubsService.create(dto, orgId);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateHubDto) {
    return this.hubsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hubsService.remove(id);
  }
}
