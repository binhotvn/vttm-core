import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { HubsService } from '../hubs.service';
import { Hub } from '../entities/hub.entity';

const mockRepo = {
  findAndCount: jest.fn(), findOne: jest.fn(),
  create: jest.fn(), save: jest.fn(), softRemove: jest.fn(),
};

describe('HubsService', () => {
  let service: HubsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        HubsService,
        { provide: getRepositoryToken(Hub), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<HubsService>(HubsService);
    jest.clearAllMocks();
  });

  it('should find all hubs with pagination', async () => {
    mockRepo.findAndCount.mockResolvedValue([[{ id: 'h1', name: 'HCM SC' }], 1]);
    const result = await service.findAll({ page: 1, limit: 20 }, 'org-1');
    expect(result.data).toHaveLength(1);
    expect(result.meta.total).toBe(1);
  });

  it('should throw NotFoundException for missing hub', async () => {
    mockRepo.findOne.mockResolvedValue(null);
    await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
  });

  it('should create hub with PostGIS point', async () => {
    mockRepo.create.mockImplementation((d: any) => d);
    mockRepo.save.mockImplementation((d: any) => d);

    const result = await service.create({
      name: 'Test Hub', code: 'TH-01', type: 'SORTING_CENTER',
      address: { streetAddress: '123 Test', country: 'VN' },
      lat: 10.77, lng: 106.70,
    }, 'org-1');

    expect(mockRepo.create).toHaveBeenCalledWith(
      expect.objectContaining({ organizationId: 'org-1' }),
    );
  });

  it('should soft remove hub', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'h1' });
    await service.remove('h1');
    expect(mockRepo.softRemove).toHaveBeenCalled();
  });
});
