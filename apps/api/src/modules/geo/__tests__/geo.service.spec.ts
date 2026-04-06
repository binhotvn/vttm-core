import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { GeoService } from '../geo.service';
import { Province } from '../entities/province.entity';
import { District } from '../entities/district.entity';
import { Ward } from '../entities/ward.entity';

const mockProvinceRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};
const mockDistrictRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};
const mockWardRepo = {
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    limit: jest.fn().mockReturnThis(),
    getMany: jest.fn().mockResolvedValue([]),
  })),
};

describe('GeoService', () => {
  let service: GeoService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        GeoService,
        { provide: getRepositoryToken(Province), useValue: mockProvinceRepo },
        { provide: getRepositoryToken(District), useValue: mockDistrictRepo },
        { provide: getRepositoryToken(Ward), useValue: mockWardRepo },
      ],
    }).compile();
    service = module.get<GeoService>(GeoService);
    jest.clearAllMocks();
  });

  it('should find all provinces', async () => {
    mockProvinceRepo.find.mockResolvedValue([{ code: '79', name: 'HCM' }]);
    const result = await service.findAllProvinces();
    expect(result).toHaveLength(1);
  });

  it('should find districts by province', async () => {
    mockDistrictRepo.find.mockResolvedValue([{ code: '760', name: 'Q1' }]);
    const result = await service.findDistrictsByProvince('79');
    expect(result).toHaveLength(1);
  });

  it('should find wards by district', async () => {
    mockWardRepo.find.mockResolvedValue([{ code: '26734', name: 'Ben Nghe' }]);
    const result = await service.findWardsByDistrict('760');
    expect(result).toHaveLength(1);
  });

  it('should search across all levels', async () => {
    const result = await service.search('Phu Nhuan');
    expect(result).toHaveProperty('provinces');
    expect(result).toHaveProperty('districts');
    expect(result).toHaveProperty('wards');
  });

  it('should return empty for empty query', async () => {
    const result = await service.search('');
    expect(result.provinces).toHaveLength(0);
  });
});
