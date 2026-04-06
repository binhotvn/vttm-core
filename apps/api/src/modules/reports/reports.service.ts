import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { Shipment } from '../shipments/entities/shipment.entity';
import { Order } from '../orders/entities/order.entity';
import { ShipmentStatus } from '@vttm/shared';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(Shipment)
    private readonly shipmentRepo: Repository<Shipment>,
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
  ) {}

  async getDashboard(organizationId?: string) {
    const where: any = {};
    if (organizationId) where.organizationId = organizationId;

    const [totalOrders, totalShipments] = await Promise.all([
      this.orderRepo.count({ where }),
      this.shipmentRepo.count({ where }),
    ]);

    const delivered = await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.DELIVERED } });
    const inTransit = await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.IN_TRANSIT } });
    const outForDelivery = await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.OUT_FOR_DELIVERY } });
    const exceptions = await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.EXCEPTION } });
    const deliveryAttempted = await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.DELIVERY_ATTEMPTED } });

    const deliveryRate = totalShipments > 0
      ? Math.round((delivered / totalShipments) * 10000) / 100
      : 0;

    // Revenue (sum of shippingCost for delivered shipments)
    const revenueResult = await this.shipmentRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s."shippingCost"), 0)', 'total')
      .where(organizationId ? 's."organizationId" = :orgId' : '1=1', { orgId: organizationId })
      .andWhere('s.status = :status', { status: ShipmentStatus.DELIVERED })
      .getRawOne();

    const totalCodResult = await this.shipmentRepo
      .createQueryBuilder('s')
      .select('COALESCE(SUM(s."codAmount"), 0)', 'total')
      .where(organizationId ? 's."organizationId" = :orgId' : '1=1', { orgId: organizationId })
      .andWhere('s.status = :status', { status: ShipmentStatus.DELIVERED })
      .getRawOne();

    return {
      totalOrders,
      totalShipments,
      delivered,
      inTransit,
      outForDelivery,
      exceptions,
      deliveryAttempted,
      deliveryRate,
      revenue: parseInt(revenueResult?.total || '0'),
      totalCodCollected: parseInt(totalCodResult?.total || '0'),
      statusBreakdown: {
        LABEL_CREATED: await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.LABEL_CREATED } }),
        PICKED_UP: await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.PICKED_UP } }),
        IN_TRANSIT: inTransit,
        AT_DESTINATION_HUB: await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.AT_DESTINATION_HUB } }),
        OUT_FOR_DELIVERY: outForDelivery,
        DELIVERED: delivered,
        DELIVERY_ATTEMPTED: deliveryAttempted,
        EXCEPTION: exceptions,
        RETURNED_TO_SENDER: await this.shipmentRepo.count({ where: { ...where, status: ShipmentStatus.RETURNED_TO_SENDER } }),
      },
    };
  }

  async getShipmentReport(organizationId?: string) {
    const qb = this.shipmentRepo.createQueryBuilder('s')
      .select('s.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .addSelect('COALESCE(SUM(s."shippingCost"), 0)', 'revenue')
      .addSelect('COALESCE(SUM(s."codAmount"), 0)', 'codTotal')
      .groupBy('s.status')
      .orderBy('count', 'DESC');

    if (organizationId) qb.where('s."organizationId" = :orgId', { orgId: organizationId });

    return qb.getRawMany();
  }

  async getRevenueReport(organizationId?: string) {
    const qb = this.shipmentRepo.createQueryBuilder('s')
      .select("TO_CHAR(s.\"createdAt\", 'YYYY-MM-DD')", 'date')
      .addSelect('COUNT(*)', 'shipments')
      .addSelect('COALESCE(SUM(s."shippingCost"), 0)', 'revenue')
      .addSelect('COALESCE(SUM(s."codAmount"), 0)', 'cod')
      .where('s.status = :status', { status: ShipmentStatus.DELIVERED })
      .groupBy("TO_CHAR(s.\"createdAt\", 'YYYY-MM-DD')")
      .orderBy('date', 'DESC')
      .limit(30);

    if (organizationId) qb.andWhere('s."organizationId" = :orgId', { orgId: organizationId });

    return qb.getRawMany();
  }
}
