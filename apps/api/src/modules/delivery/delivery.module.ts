import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DeliveryService } from './delivery.service';
import { DeliveryAttempt } from './entities/delivery-attempt.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DeliveryAttempt])],
  providers: [DeliveryService],
  exports: [DeliveryService],
})
export class DeliveryModule {}
