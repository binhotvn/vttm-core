import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { RoutesService } from '../routes.service';
import { Route } from '../entities/route.entity';
import { RouteStop } from '../entities/route-stop.entity';

const mockRouteRepo = {
  findOne: jest.fn(), create: jest.fn(), save: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    addOrderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
};
const mockStopRepo = {
  findOne: jest.fn(), save: jest.fn(),
};

describe('RoutesService', () => {
  let service: RoutesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        RoutesService,
        { provide: getRepositoryToken(Route), useValue: mockRouteRepo },
        { provide: getRepositoryToken(RouteStop), useValue: mockStopRepo },
      ],
    }).compile();
    service = module.get<RoutesService>(RoutesService);
    jest.clearAllMocks();
    mockRouteRepo.count.mockResolvedValue(0);
  });

  describe('optimize', () => {
    it('should reorder stops by nearest neighbor', async () => {
      mockRouteRepo.findOne.mockResolvedValue({
        id: 'r1', stops: [
          { id: 's1', sequenceNumber: 1, geoLocation: { lat: 10.78, lng: 106.70 } },
          { id: 's2', sequenceNumber: 2, geoLocation: { lat: 10.70, lng: 106.60 } },
          { id: 's3', sequenceNumber: 3, geoLocation: { lat: 10.77, lng: 106.69 } },
        ],
      });
      mockStopRepo.save.mockImplementation((s: any) => s);
      mockRouteRepo.save.mockImplementation((r: any) => r);

      const result = await service.optimize('r1');
      expect(result.status).toBe('OPTIMIZED');
      expect(result.totalDistanceKm).toBeGreaterThan(0);
    });
  });

  describe('start', () => {
    it('should set IN_PROGRESS and actualStartTime', async () => {
      mockRouteRepo.findOne.mockResolvedValue({ id: 'r1', status: 'OPTIMIZED', stops: [] });
      mockRouteRepo.save.mockImplementation((r: any) => r);

      const result = await service.start('r1');
      expect(result.status).toBe('IN_PROGRESS');
      expect(result.actualStartTime).toBeDefined();
    });
  });

  describe('completeStop', () => {
    it('should mark stop as COMPLETED', async () => {
      mockStopRepo.findOne.mockResolvedValue({ id: 'stop1', routeId: 'r1', status: 'PENDING' });
      mockStopRepo.save.mockImplementation((s: any) => s);
      mockRouteRepo.findOne.mockResolvedValue({ id: 'r1', stops: [{ status: 'COMPLETED' }] });
      mockRouteRepo.save.mockImplementation((r: any) => r);

      const result = await service.completeStop('r1', 'stop1');
      expect(result).toBeDefined();
    });
  });
});
