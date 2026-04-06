import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PickupController } from './pickup.controller';
import { PickupService } from './pickup.service';
import { PickupRequest } from './entities/pickup-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([PickupRequest])],
  controllers: [PickupController],
  providers: [PickupService],
  exports: [PickupService],
})
export class PickupModule {}
