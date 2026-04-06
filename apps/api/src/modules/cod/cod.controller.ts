import { Controller, Get, Post, Body, Query, Param } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { CodService } from './cod.service';
import { VerifyCodDto, ProcessTransferDto } from './dto/cod.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';

@Controller('cod')
export class CodController {
  constructor(private readonly codService: CodService) {}

  @Get('daily')
  @Roles(UserRole.CASHIER)
  getDailySummary(@Query('date') date: string, @CurrentUser() u: JwtPayload) {
    return this.codService.getDailySummary(u.organizationId!, date);
  }

  @Post('verify')
  @Roles(UserRole.CASHIER)
  verify(@Body() dto: VerifyCodDto, @CurrentUser() u: JwtPayload) {
    return this.codService.verifyDriverCod(u.organizationId!, dto.driverId, dto.date, dto.actualTotal);
  }

  @Get('pending-transfers')
  @Roles(UserRole.CASHIER)
  getPendingTransfers(@CurrentUser() u: JwtPayload) {
    return this.codService.getPendingTransfers(u.organizationId!);
  }

  @Post('transfer')
  @Roles(UserRole.ORG_ADMIN)
  processTransfer(@Body() dto: ProcessTransferDto, @CurrentUser() u: JwtPayload) {
    return this.codService.processTransfer(u.organizationId!, dto.senderId, dto.bankTransferRef);
  }

  @Get('discrepancies')
  @Roles(UserRole.CASHIER)
  getDiscrepancies(@CurrentUser() u: JwtPayload) {
    return this.codService.getDiscrepancies(u.organizationId!);
  }

  @Get('statement/:senderId')
  getSenderStatement(@Param('senderId') senderId: string, @CurrentUser() u: JwtPayload) {
    return this.codService.getSenderStatement(u.organizationId!, senderId);
  }
}
