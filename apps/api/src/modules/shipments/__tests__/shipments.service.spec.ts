import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { ShipmentsService } from '../shipments.service';
import { Shipment } from '../entities/shipment.entity';
import { TrackingEvent } from '../../tracking/entities/tracking-event.entity';
import { ShipmentStatus } from '@vttm/shared';

const mockShipmentRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    getCount: jest.fn().mockResolvedValue(0),
  })),
};

const mockTrackingEventRepo = {
  create: jest.fn(),
  save: jest.fn().mockResolvedValue({}),
};

const mockDataSource = {};

describe('ShipmentsService', () => {
  let service: ShipmentsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ShipmentsService,
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
        { provide: getRepositoryToken(TrackingEvent), useValue: mockTrackingEventRepo },
        { provide: DataSource, useValue: mockDataSource },
      ],
    }).compile();
    service = module.get<ShipmentsService>(ShipmentsService);
    jest.clearAllMocks();
    mockShipmentRepo.createQueryBuilder.mockReturnValue({
      where: jest.fn().mockReturnThis(),
      getCount: jest.fn().mockResolvedValue(0),
    });
    mockTrackingEventRepo.save.mockResolvedValue({});
  });

  describe('create', () => {
    it('should create shipment with tracking number', async () => {
      const shipment = { id: 's-1', trackingNumber: 'NW-20260405-000001-6', status: 'LABEL_CREATED', codAmount: 350000, codFee: 10000 };
      mockShipmentRepo.create.mockReturnValue(shipment);
      mockShipmentRepo.save.mockResolvedValue(shipment);

      const result = await service.create({
        orderId: 'ord-1',
        senderAddress: { contactName: 'A', phone: '+84901234567', country: 'VN', streetAddress: '1' },
        recipientAddress: { contactName: 'B', phone: '+84987654321', country: 'VN', streetAddress: '2' },
        weightKg: 1.0,
        codAmount: 350000,
      }, 'org-1');

      expect(result.trackingNumber).toMatch(/^NW-/);
      expect(mockTrackingEventRepo.save).toHaveBeenCalled();
    });

    it('should calculate COD fee (1.5%, min 10000)', async () => {
      mockShipmentRepo.create.mockImplementation((d: any) => d);
      mockShipmentRepo.save.mockImplementation((d: any) => d);

      await service.create({
        orderId: 'ord-1',
        senderAddress: { contactName: 'A', phone: '+84901234567', country: 'VN', streetAddress: '1' },
        recipientAddress: { contactName: 'B', phone: '+84987654321', country: 'VN', streetAddress: '2' },
        codAmount: 350000,
      }, 'org-1');

      expect(mockShipmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ codFee: 10000 }), // max(350000*0.015=5250, 10000) = 10000
      );
    });

    it('should calculate COD fee for large amounts', async () => {
      mockShipmentRepo.create.mockImplementation((d: any) => d);
      mockShipmentRepo.save.mockImplementation((d: any) => d);

      await service.create({
        orderId: 'ord-1',
        senderAddress: { contactName: 'A', phone: '+84901234567', country: 'VN', streetAddress: '1' },
        recipientAddress: { contactName: 'B', phone: '+84987654321', country: 'VN', streetAddress: '2' },
        codAmount: 2000000,
      }, 'org-1');

      expect(mockShipmentRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ codFee: 30000 }), // 2000000*0.015=30000 > 10000
      );
    });
  });

  describe('updateStatus', () => {
    it('should allow valid transitions', async () => {
      const shipment = { id: 's-1', status: ShipmentStatus.LABEL_CREATED, deliveryAttempts: 0 };
      mockShipmentRepo.findOne.mockResolvedValue(shipment);
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      const result = await service.updateStatus('s-1', { status: ShipmentStatus.PICKED_UP, location: 'Test' });
      expect(result.status).toBe(ShipmentStatus.PICKED_UP);
      expect(result.previousStatus).toBe(ShipmentStatus.LABEL_CREATED);
    });

    it('should reject invalid transitions', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({ id: 's-1', status: ShipmentStatus.DELIVERED });
      await expect(
        service.updateStatus('s-1', { status: ShipmentStatus.PICKED_UP }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should set pickedUpAt on PICKED_UP', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({ id: 's-1', status: ShipmentStatus.LABEL_CREATED, deliveryAttempts: 0 });
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      const result = await service.updateStatus('s-1', { status: ShipmentStatus.PICKED_UP });
      expect(result.pickedUpAt).toBeDefined();
    });

    it('should set actualDeliveryDate on DELIVERED', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({ id: 's-1', status: ShipmentStatus.OUT_FOR_DELIVERY, deliveryAttempts: 0 });
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      const result = await service.updateStatus('s-1', { status: ShipmentStatus.DELIVERED });
      expect(result.actualDeliveryDate).toBeDefined();
    });

    it('should increment deliveryAttempts on DELIVERY_ATTEMPTED', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({ id: 's-1', status: ShipmentStatus.OUT_FOR_DELIVERY, deliveryAttempts: 1 });
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      const result = await service.updateStatus('s-1', { status: ShipmentStatus.DELIVERY_ATTEMPTED });
      expect(result.deliveryAttempts).toBe(2);
    });

    it('should create tracking event on status change', async () => {
      mockShipmentRepo.findOne.mockResolvedValue({ id: 's-1', status: ShipmentStatus.LABEL_CREATED, deliveryAttempts: 0 });
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      await service.updateStatus('s-1', { status: ShipmentStatus.PICKED_UP, location: 'HCM' });
      expect(mockTrackingEventRepo.save).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException', async () => {
      mockShipmentRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('batchUpdateStatus', () => {
    it('should update multiple shipments and collect errors', async () => {
      const shipment = { id: 's-1', status: ShipmentStatus.LABEL_CREATED, deliveryAttempts: 0 };
      mockShipmentRepo.findOne
        .mockResolvedValueOnce(shipment)
        .mockResolvedValueOnce(null); // second one not found
      mockShipmentRepo.save.mockImplementation((s: any) => s);

      const result = await service.batchUpdateStatus(
        ['s-1', 's-missing'], ShipmentStatus.PICKED_UP,
      );
      expect(result.updated).toContain('s-1');
      expect(result.errors).toHaveLength(1);
    });
  });
});
