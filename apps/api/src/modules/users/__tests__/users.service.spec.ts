import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { UsersService } from '../users.service';
import { User } from '../entities/user.entity';

const mockRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  softRemove: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getRepositoryToken(User), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      const users = [{ id: '1', email: 'a@b.com', passwordHash: 'hash', fullName: 'A' }];
      mockRepo.findAndCount.mockResolvedValue([users, 1]);
      const result = await service.findAll({ page: 1, limit: 20 }, 'org-1');
      expect(result.data).toHaveLength(1);
      expect(result.data[0]).not.toHaveProperty('passwordHash');
      expect(result.meta.total).toBe(1);
    });

    it('should filter by organizationId', async () => {
      mockRepo.findAndCount.mockResolvedValue([[], 0]);
      await service.findAll({ page: 1, limit: 20 }, 'org-1');
      expect(mockRepo.findAndCount).toHaveBeenCalledWith(
        expect.objectContaining({ where: { organizationId: 'org-1' } }),
      );
    });
  });

  describe('findOne', () => {
    it('should return a user', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1', email: 'a@b.com', passwordHash: 'h', fullName: 'A' });
      const result = await service.findOne('1');
      expect(result).toHaveProperty('email');
      expect(result).not.toHaveProperty('passwordHash');
    });

    it('should throw NotFoundException', async () => {
      mockRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('should hash password and create user', async () => {
      mockRepo.create.mockReturnValue({ id: '1', email: 'a@b.com' });
      mockRepo.save.mockResolvedValue({ id: '1', email: 'a@b.com', passwordHash: 'hashed' });
      const result = await service.create({ email: 'a@b.com', password: 'Test@1234', fullName: 'A' });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('update', () => {
    it('should update user fields', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1', fullName: 'Old', passwordHash: 'h' });
      mockRepo.save.mockResolvedValue({ id: '1', fullName: 'New', passwordHash: 'h' });
      const result = await service.update('1', { fullName: 'New' });
      expect(result).not.toHaveProperty('passwordHash');
    });
  });

  describe('remove', () => {
    it('should soft delete a user', async () => {
      mockRepo.findOne.mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(mockRepo.softRemove).toHaveBeenCalled();
    });
  });
});
