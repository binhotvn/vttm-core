import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { TrackingService } from '../tracking.service';
import { TrackingEvent } from '../entities/tracking-event.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

const mockShipmentRepo = { findOne: jest.fn() };
const mockEventRepo = { find: jest.fn() };

describe('TrackingService', () => {
  let service: TrackingService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TrackingService,
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
        { provide: getRepositoryToken(TrackingEvent), useValue: mockEventRepo },
      ],
    }).compile();
    service = module.get<TrackingService>(TrackingService);
    jest.clearAllMocks();
  });

  describe('trackByNumber', () => {
    it('should return tracking info with events', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({
        id: 's-1', trackingNumber: 'NW-001', status: 'DELIVERED',
        serviceType: 'EXPRESS', senderAddress: { provinceName: 'HCM' },
        recipientAddress: { provinceName: 'DN' },
      });
      mockEventRepo.find.mockResolvedValue([
        { status: 'DELIVERED', titleVi: 'Đã giao', titleEn: 'Delivered', timestamp: new Date() },
      ]);

      const result = await service.trackByNumber('NW-001', 'vi');
      expect(result.trackingNumber).toBe('NW-001');
      expect(result.statusLabel).toBe('Đã giao hàng');
      expect(result.events).toHaveLength(1);
      expect(result.events[0].title).toBe('Đã giao');
    });

    it('should return English labels when lang=en', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({
        id: 's-1', trackingNumber: 'NW-001', status: 'DELIVERED',
        serviceType: 'EXPRESS', senderAddress: {}, recipientAddress: {},
      });
      mockEventRepo.find.mockResolvedValue([
        { status: 'DELIVERED', titleVi: 'Đã giao', titleEn: 'Delivered', timestamp: new Date() },
      ]);

      const result = await service.trackByNumber('NW-001', 'en');
      expect(result.statusLabel).toBe('Delivered');
      expect(result.events[0].title).toBe('Delivered');
    });

    it('should throw NotFoundException for unknown tracking number', async () => {
      mockShipmentRepo.findOne.mockResolvedValue(null);
      await expect(service.trackByNumber('INVALID')).rejects.toThrow(NotFoundException);
    });
  });

  describe('trackMultiple', () => {
    it('should return results for multiple tracking numbers', async () => {
      mockShipmentRepo.findOne
        .mockResolvedValueOnce({ id: '1', trackingNumber: 'A', status: 'DELIVERED', serviceType: 'STD', senderAddress: {}, recipientAddress: {} })
        .mockResolvedValueOnce(null);
      mockEventRepo.find.mockResolvedValue([]);

      const result = await service.trackMultiple(['A', 'B']);
      expect(result['A']).toBeDefined();
      expect(result['B']).toHaveProperty('error');
    });
  });
});
