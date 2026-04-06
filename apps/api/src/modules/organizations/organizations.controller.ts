import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { OrganizationsService } from './organizations.service';
import { CreateOrganizationDto } from './dto/create-organization.dto';
import { UpdateOrganizationDto } from './dto/update-organization.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('organizations')
@Roles(UserRole.SUPER_ADMIN)
export class OrganizationsController {
  constructor(private readonly orgsService: OrganizationsService) {}

  @Get()
  findAll(@Query(new ParsePaginationPipe()) pagination: PaginationDto) {
    return this.orgsService.findAll(pagination);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgsService.findOne(id);
  }

  @Post()
  create(@Body() dto: CreateOrganizationDto) {
    return this.orgsService.create(dto);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateOrganizationDto) {
    return this.orgsService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.orgsService.remove(id);
  }
}
