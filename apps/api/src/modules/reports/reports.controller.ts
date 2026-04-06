import { Controller, Get } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { ReportsService } from './reports.service';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';

@Controller('reports')
@Roles(UserRole.DISPATCHER)
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get('dashboard')
  dashboard(@CurrentUser() u: JwtPayload) {
    return this.reportsService.getDashboard(
      u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined,
    );
  }

  @Get('shipments')
  shipments(@CurrentUser() u: JwtPayload) {
    return this.reportsService.getShipmentReport(
      u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined,
    );
  }

  @Get('revenue')
  revenue(@CurrentUser() u: JwtPayload) {
    return this.reportsService.getRevenueReport(
      u.role === UserRole.SUPER_ADMIN ? undefined : u.organizationId ?? undefined,
    );
  }
}
