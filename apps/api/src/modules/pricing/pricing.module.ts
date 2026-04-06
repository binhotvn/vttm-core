import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PricingController } from './pricing.controller';
import { PricingService } from './pricing.service';
import { PricingZone } from './entities/pricing-zone.entity';
import { PricingRule } from './entities/pricing-rule.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PricingZone, PricingRule])],
  controllers: [PricingController],
  providers: [PricingService],
  exports: [PricingService],
})
export class PricingModule {}
