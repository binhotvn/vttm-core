import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReportsController } from './reports.controller';
import { ReportsService } from './reports.service';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Shipment, Order])],
  controllers: [ReportsController],
  providers: [ReportsService],
})
export class ReportsModule {}
