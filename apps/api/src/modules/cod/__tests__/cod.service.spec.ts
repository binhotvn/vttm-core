import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CodService } from '../cod.service';
import { CodCollection } from '../entities/cod-collection.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

const mockCodRepo = {
  find: jest.fn(), create: jest.fn(), save: jest.fn(),
};
const mockShipmentRepo = {};

describe('CodService', () => {
  let service: CodService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        CodService,
        { provide: getRepositoryToken(CodCollection), useValue: mockCodRepo },
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
      ],
    }).compile();
    service = module.get<CodService>(CodService);
    jest.clearAllMocks();
  });

  describe('createCollection', () => {
    it('should calculate COD fee and net transfer', async () => {
      const shipment = { id: 's1', organizationId: 'org-1', codAmount: 500000, shippingCost: 25000 } as any;
      mockCodRepo.create.mockImplementation((d: any) => d);
      mockCodRepo.save.mockImplementation((d: any) => d);

      const result = await service.createCollection(shipment, 'driver-1', 500000);
      expect(result.codFee).toBe(10000); // max(500000*1.5/100=7500, 10000)=10000
      expect(result.netTransferAmount).toBe(465000); // 500000 - 10000 - 25000
      expect(result.status).toBe('COLLECTED');
    });

    it('should flag discrepancy when amounts differ', async () => {
      const shipment = { id: 's1', organizationId: 'org-1', codAmount: 500000, shippingCost: 25000 } as any;
      mockCodRepo.create.mockImplementation((d: any) => d);
      mockCodRepo.save.mockImplementation((d: any) => d);

      const result = await service.createCollection(shipment, 'driver-1', 450000);
      expect(result.status).toBe('DISCREPANCY');
      expect(result.discrepancyNote).toContain('Expected 500000');
    });
  });

  describe('getDailySummary', () => {
    it('should group by driver', async () => {
      mockCodRepo.find.mockResolvedValue([
        { driverId: 'd1', expectedAmount: 100000, collectedAmount: 100000, codFee: 10000, netTransferAmount: 80000, status: 'COLLECTED' },
        { driverId: 'd1', expectedAmount: 200000, collectedAmount: 200000, codFee: 10000, netTransferAmount: 170000, status: 'COLLECTED' },
        { driverId: 'd2', expectedAmount: 150000, collectedAmount: 150000, codFee: 10000, netTransferAmount: 120000, status: 'COLLECTED' },
      ]);

      const result = await service.getDailySummary('org-1', '2026-04-06');
      expect(result.drivers).toHaveLength(2);
      expect(result.totals.shipmentCount).toBe(3);
      expect(result.totals.expectedTotal).toBe(450000);
    });
  });

  describe('verifyDriverCod', () => {
    it('should verify matching totals', async () => {
      mockCodRepo.find.mockResolvedValue([
        { collectedAmount: 100000 },
        { collectedAmount: 200000 },
      ]);
      mockCodRepo.save.mockImplementation((c: any) => c);

      const result = await service.verifyDriverCod('org-1', 'd1', '2026-04-06', 300000);
      expect(result.verified).toBe(true);
    });

    it('should flag discrepancy on mismatch', async () => {
      mockCodRepo.find.mockResolvedValue([
        { collectedAmount: 100000 },
        { collectedAmount: 200000 },
      ]);
      mockCodRepo.save.mockImplementation((c: any) => c);

      const result = await service.verifyDriverCod('org-1', 'd1', '2026-04-06', 280000);
      expect(result.verified).toBe(false);
      expect(result.difference).toBe(-20000);
    });
  });
});
