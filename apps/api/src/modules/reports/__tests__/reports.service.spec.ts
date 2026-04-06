import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReportsService } from '../reports.service';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { Order } from '../../orders/entities/order.entity';

const mockShipmentRepo = {
  count: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    select: jest.fn().mockReturnThis(),
    addSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    groupBy: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getRawOne: jest.fn().mockResolvedValue({ total: '50000' }),
    getRawMany: jest.fn().mockResolvedValue([]),
  })),
};
const mockOrderRepo = { count: jest.fn() };

describe('ReportsService', () => {
  let service: ReportsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReportsService,
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
      ],
    }).compile();
    service = module.get<ReportsService>(ReportsService);
    jest.clearAllMocks();
  });

  describe('getDashboard', () => {
    it('should return dashboard KPIs', async () => {
      mockOrderRepo.count.mockResolvedValue(10);
      mockShipmentRepo.count
        .mockResolvedValueOnce(20) // totalShipments
        .mockResolvedValueOnce(15) // delivered
        .mockResolvedValueOnce(3)  // inTransit
        .mockResolvedValueOnce(1)  // outForDelivery
        .mockResolvedValueOnce(1)  // exceptions
        .mockResolvedValueOnce(0)  // deliveryAttempted
        .mockResolvedValueOnce(0)  // LABEL_CREATED
        .mockResolvedValueOnce(0)  // PICKED_UP
        .mockResolvedValueOnce(0)  // AT_DESTINATION_HUB
        .mockResolvedValueOnce(0); // RETURNED_TO_SENDER
      mockShipmentRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '100000' }),
        getRawMany: jest.fn().mockResolvedValue([]),
      });

      const result = await service.getDashboard('org-1');
      expect(result.totalOrders).toBe(10);
      expect(result.totalShipments).toBe(20);
      expect(result.delivered).toBe(15);
      expect(result.deliveryRate).toBe(75);
    });
  });

  describe('getShipmentReport', () => {
    it('should return status breakdown', async () => {
      mockShipmentRepo.createQueryBuilder.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        groupBy: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        getRawOne: jest.fn().mockResolvedValue({ total: '0' }),
        getRawMany: jest.fn().mockResolvedValue([
          { status: 'DELIVERED', count: '15', revenue: '150000', codTotal: '500000' },
          { status: 'IN_TRANSIT', count: '3', revenue: '0', codTotal: '100000' },
        ]),
      });

      const result = await service.getShipmentReport('org-1');
      expect(result).toHaveLength(2);
      expect(result[0].status).toBe('DELIVERED');
    });
  });
});
