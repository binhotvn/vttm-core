import { Controller, Get, Post, Patch, Delete, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { WebhooksService } from './webhooks.service';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';

@Controller('webhooks')
@Roles(UserRole.ORG_ADMIN)
export class WebhooksController {
  constructor(private readonly webhooksService: WebhooksService) {}

  @Get()
  findAll(@CurrentUser() u: JwtPayload) { return this.webhooksService.findAll(u.organizationId!); }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) { return this.webhooksService.findOne(id); }

  @Post()
  create(@Body() dto: CreateWebhookDto, @CurrentUser() u: JwtPayload) {
    return this.webhooksService.create(dto, u.organizationId!);
  }

  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateWebhookDto) {
    return this.webhooksService.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseUUIDPipe) id: string) { return this.webhooksService.remove(id); }

  @Get(':id/logs')
  getLogs(@Param('id', ParseUUIDPipe) id: string) { return this.webhooksService.getLogs(id); }

  @Post(':id/test')
  test(@Param('id', ParseUUIDPipe) id: string) { return this.webhooksService.test(id); }
}
