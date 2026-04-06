import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrganizationsService } from '../organizations.service';
import { Organization } from '../entities/organization.entity';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
};

describe('OrganizationsService', () => {
  let service: OrganizationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrganizationsService,
        { provide: getRepositoryToken(Organization), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<OrganizationsService>(OrganizationsService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated organizations', async () => {
      mockRepo.findAndCount.mockResolvedValue([[{ id: '1', name: 'Org' }], 1]);
      const result = await service.findAll({ page: 1, limit: 20 });
      expect(result.data).toHaveLength(1);
      expect(result.meta.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return an organization', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1', name: 'VTTM' });
      const result = await service.findOne('1');
      expect(result.name).toBe('VTTM');
    });

    it('should throw NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should create an organization', async () => {
      mockRepo.create.mockReturnValue({ name: 'New Org', slug: 'new-org' });
      mockRepo.save.mockResolvedValue({ id: '1', name: 'New Org', slug: 'new-org' });
      const result = await service.create({ name: 'New Org', slug: 'new-org' });
      expect(result.name).toBe('New Org');
    });
  });

  describe('update', () => {
    it('should update organization', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1', name: 'Old' });
      mockRepo.save.mockResolvedValue({ id: '1', name: 'Updated' });
      const result = await service.update('1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should soft remove', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(mockRepo.softRemove).toHaveBeenCalled();
    });
  });
});
