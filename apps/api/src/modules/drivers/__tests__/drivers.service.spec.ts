import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { DriversService } from '../drivers.service';
import { Driver } from '../entities/driver.entity';
import { DriverStatus } from '@vttm/shared';

const mockRepo = {
  findAndCount: jest.fn(), findOne: jest.fn(), find: jest.fn(),
  create: jest.fn(), save: jest.fn(),
};

describe('DriversService', () => {
  let service: DriversService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        DriversService,
        { provide: getRepositoryToken(Driver), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<DriversService>(DriversService);
    jest.clearAllMocks();
  });

  describe('findBestDriver', () => {
    it('should return nearest driver', async () => {
      mockRepo.find.mockResolvedValue([
        { id: 'd1', status: DriverStatus.AVAILABLE, currentLocation: { lat: 10.78, lng: 106.70 }, capabilities: { deliveryZones: [], maxWeightKg: 30 }, performanceMetrics: {}, schedule: null },
        { id: 'd2', status: DriverStatus.AVAILABLE, currentLocation: { lat: 10.70, lng: 106.60 }, capabilities: { deliveryZones: [], maxWeightKg: 30 }, performanceMetrics: {}, schedule: null },
      ]);

      const result = await service.findBestDriver('org-1', {
        targetLat: 10.77, targetLng: 106.70, strategy: 'NEAREST',
      });
      expect(result?.id).toBe('d1'); // closer to target
    });

    it('should filter by weight capacity', async () => {
      mockRepo.find.mockResolvedValue([
        { id: 'd1', status: DriverStatus.AVAILABLE, capabilities: { maxWeightKg: 10 }, performanceMetrics: {}, schedule: null },
        { id: 'd2', status: DriverStatus.AVAILABLE, capabilities: { maxWeightKg: 50 }, performanceMetrics: {}, schedule: null },
      ]);

      const result = await service.findBestDriver('org-1', {
        totalWeightKg: 30, strategy: 'CAPACITY',
      });
      expect(result?.id).toBe('d2');
    });

    it('should return null when no drivers available', async () => {
      mockRepo.find.mockResolvedValue([]);
      const result = await service.findBestDriver('org-1', {});
      expect(result).toBeNull();
    });

    it('should filter by zone', async () => {
      mockRepo.find.mockResolvedValue([
        { id: 'd1', status: DriverStatus.AVAILABLE, capabilities: { deliveryZones: ['760'] }, performanceMetrics: {}, schedule: null },
        { id: 'd2', status: DriverStatus.AVAILABLE, capabilities: { deliveryZones: ['778'] }, performanceMetrics: {}, schedule: null },
      ]);

      const result = await service.findBestDriver('org-1', {
        districtCodes: ['760'], strategy: 'ZONE_BASED',
      });
      expect(result?.id).toBe('d1');
    });
  });

  describe('updateStatus', () => {
    it('should update driver status', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'd1', status: DriverStatus.AVAILABLE });
      mockRepo.save.mockImplementation((d: any) => d);

      const result = await service.updateStatus('d1', DriverStatus.ON_DUTY);
      expect(result.status).toBe(DriverStatus.ON_DUTY);
    });
  });

  describe('updateLocation', () => {
    it('should update GPS coordinates', async () => {
      mockRepo.findOne.mockResolvedValue({ id: 'd1' });
      mockRepo.save.mockImplementation((d: any) => d);

      const result = await service.updateLocation('d1', { lat: 10.77, lng: 106.70 });
      expect(result.currentLocation.lat).toBe(10.77);
      expect(result.currentLocation.lng).toBe(106.70);
    });
  });
});
