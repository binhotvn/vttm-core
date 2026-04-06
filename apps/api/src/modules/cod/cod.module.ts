import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CodController } from './cod.controller';
import { CodService } from './cod.service';
import { CodCollection } from './entities/cod-collection.entity';
import { Shipment } from '../shipments/entities/shipment.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CodCollection, Shipment])],
  controllers: [CodController],
  providers: [CodService],
  exports: [CodService],
})
export class CodModule {}
