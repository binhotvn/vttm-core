import { Controller, Get, Post, Patch, Body, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { UserRole } from '@vttm/shared';
import { PricingService } from './pricing.service';
import { CalculatePriceDto } from './dto/calculate-price.dto';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { PaginationDto, ParsePaginationPipe } from '../../common/pipes/parse-pagination.pipe';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  @Post('calculate')
  calculate(@Body() dto: CalculatePriceDto, @CurrentUser() user: JwtPayload) {
    return this.pricingService.calculate(dto, user.organizationId!);
  }

  @Get('zones')
  findAllZones(@CurrentUser() user: JwtPayload) {
    return this.pricingService.findAllZones(user.organizationId!);
  }

  @Post('zones')
  @Roles(UserRole.ORG_ADMIN)
  createZone(@Body() body: any, @CurrentUser() user: JwtPayload) {
    return this.pricingService.createZone(body, user.organizationId!);
  }

  @Get('rules')
  findAllRules(
    @Query(new ParsePaginationPipe()) pagination: PaginationDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.pricingService.findAllRules(pagination, user.organizationId!);
  }

  @Post('rules')
  @Roles(UserRole.ORG_ADMIN)
  createRule(@Body() body: any, @CurrentUser() user: JwtPayload) {
    return this.pricingService.createRule(body, user.organizationId!);
  }

  @Patch('rules/:id')
  @Roles(UserRole.ORG_ADMIN)
  updateRule(@Param('id', ParseUUIDPipe) id: string, @Body() body: any) {
    return this.pricingService.updateRule(id, body);
  }
}
