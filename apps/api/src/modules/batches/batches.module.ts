import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BatchesController } from './batches.controller';
import { BatchesService } from './batches.service';
import { Batch } from './entities/batch.entity';
import { BatchShipment } from './entities/batch-shipment.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Batch, BatchShipment, Shipment])],
  controllers: [BatchesController],
  providers: [BatchesService],
  exports: [BatchesService],
})
export class BatchesModule {}
