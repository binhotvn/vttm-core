import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { BatchesService } from '../batches.service';
import { Batch } from '../entities/batch.entity';
import { BatchShipment } from '../entities/batch-shipment.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

const mockBatchRepo = {
  findAndCount: jest.fn(), findOne: jest.fn(), create: jest.fn(), save: jest.fn(),
  count: jest.fn().mockResolvedValue(0), remove: jest.fn(), update: jest.fn(),
  find: jest.fn(), createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
};
const mockBatchShipmentRepo = {
  findOne: jest.fn(), find: jest.fn().mockResolvedValue([]), save: jest.fn(), delete: jest.fn(),
};
const mockShipmentRepo = {
  find: jest.fn().mockResolvedValue([]), findOne: jest.fn(), save: jest.fn(),
};

describe('BatchesService', () => {
  let service: BatchesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        BatchesService,
        { provide: getRepositoryToken(Batch), useValue: mockBatchRepo },
        { provide: getRepositoryToken(BatchShipment), useValue: mockBatchShipmentRepo },
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
      ],
    }).compile();
    service = module.get<BatchesService>(BatchesService);
    jest.clearAllMocks();
    mockBatchRepo.count.mockResolvedValue(0);
    mockBatchShipmentRepo.find.mockResolvedValue([]);
  });

  describe('create', () => {
    it('should create a batch with auto-generated number', async () => {
      mockBatchRepo.create.mockReturnValue({ id: 'b1', batchNumber: 'BATCH-001', type: 'TRANSFER' });
      mockBatchRepo.save.mockResolvedValue({ id: 'b1', batchNumber: 'BATCH-001' });
      mockBatchRepo.findOne.mockResolvedValue({ id: 'b1', batchNumber: 'BATCH-001', batchShipments: [] });

      const result = await service.create({ type: 'TRANSFER' as any }, 'org-1');
      expect(result.batchNumber).toBeDefined();
    });
  });

  describe('seal', () => {
    it('should seal an OPEN batch', async () => {
      mockBatchRepo.findOne.mockResolvedValue({ id: 'b1', status: 'OPEN', shipmentCount: 1, batchShipments: [] });
      mockBatchRepo.save.mockImplementation((b: any) => b);

      const result = await service.seal('b1', { sealNumber: 'SEAL-001' });
      expect(result.status).toBe('SEALED');
      expect(result.sealNumber).toBe('SEAL-001');
    });

    it('should reject sealing empty batch', async () => {
      mockBatchRepo.findOne.mockResolvedValue({ id: 'b1', status: 'OPEN', shipmentCount: 0, batchShipments: [] });
      await expect(service.seal('b1', { sealNumber: 'S' })).rejects.toThrow(BadRequestException);
    });

    it('should reject sealing already sealed batch', async () => {
      mockBatchRepo.findOne.mockResolvedValue({ id: 'b1', status: 'SEALED', batchShipments: [] });
      await expect(service.seal('b1', { sealNumber: 'S' })).rejects.toThrow(BadRequestException);
    });
  });

  describe('addShipments', () => {
    it('should reject adding to sealed batch', async () => {
      mockBatchRepo.findOne.mockResolvedValue({ id: 'b1', status: 'SEALED', batchShipments: [] });
      await expect(service.addShipments('b1', ['s1'])).rejects.toThrow(BadRequestException);
    });
  });

  describe('findOne', () => {
    it('should throw NotFoundException', async () => {
      mockBatchRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });
});
