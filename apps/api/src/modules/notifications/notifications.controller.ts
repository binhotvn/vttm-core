import { Controller, Get, Patch, Param, ParseUUIDPipe } from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';

@Controller('notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  findAll(@CurrentUser() u: JwtPayload) {
    return this.notificationsService.findByUser(u.sub);
  }

  @Get('unread-count')
  unreadCount(@CurrentUser() u: JwtPayload) {
    return this.notificationsService.getUnreadCount(u.sub);
  }

  @Patch(':id/read')
  markRead(@Param('id', ParseUUIDPipe) id: string) {
    return this.notificationsService.markRead(id);
  }

  @Patch('read-all')
  markAllRead(@CurrentUser() u: JwtPayload) {
    return this.notificationsService.markAllRead(u.sub);
  }
}
