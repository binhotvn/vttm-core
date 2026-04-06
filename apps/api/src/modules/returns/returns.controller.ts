import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole, ReturnStatus } from '@vttm/shared';
import { ReturnsService } from './returns.service';
import { CreateReturnDto } from './dto/create-return.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('returns')
export class ReturnsController {
  constructor(private readonly returnsService: ReturnsService) {}

  @Get()
  findAll(@Query(new ParsePaginationPipe()) p: PaginationDto, @CurrentUser() u: JwtPayload) {
    return this.returnsService.findAll(p, u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.returnsService.findOne(id); }

  @Post()
  create(@Body() dto: CreateReturnDto, @CurrentUser() u: JwtPayload) {
    return this.returnsService.create(dto, u.organizationId!);
  }

  @Patch(':id/approve')
  approve(@Param('id', ParseUUIDPipe) id: string) { return this.returnsService.approve(id); }

  @Patch(':id/status')
  updateStatus(@Param('id', ParseUUIDPipe) id: string, @Body() body: { status: ReturnStatus }) {
    return this.returnsService.updateStatus(id, body.status);
  }
}
