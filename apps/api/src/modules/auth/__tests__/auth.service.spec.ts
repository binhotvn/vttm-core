import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UnauthorizedException, ConflictException } from '@nestjs/common';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';
import { RefreshToken } from '../entities/refresh-token.entity';
import * as bcrypt from 'bcrypt';

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
};

const mockRefreshTokenRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-jwt-token'),
};

const mockConfigService = {
  get: jest.fn((key: string) => {
    const config: Record<string, string> = {
      'jwt.accessSecret': 'test-secret',
      'jwt.refreshSecret': 'test-refresh-secret',
      'jwt.accessExpiration': '15m',
      'jwt.refreshExpiration': '7d',
    };
    return config[key];
  }),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(RefreshToken), useValue: mockRefreshTokenRepo },
        { provide: JwtService, useValue: mockJwtService },
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      const user = { id: 'user-1', email: 'test@test.com', fullName: 'Test', role: 'CUSTOMER', organizationId: null };
      mockUserRepo.create.mockReturnValue(user);
      mockUserRepo.save.mockResolvedValue(user);
      mockRefreshTokenRepo.create.mockReturnValue({});
      mockRefreshTokenRepo.save.mockResolvedValue({});

      const result = await service.register({ email: 'test@test.com', password: 'Test@1234', fullName: 'Test' });
      expect(result.accessToken).toBe('mock-jwt-token');
      expect(result.user.email).toBe('test@test.com');
    });

    it('should throw ConflictException for duplicate email', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: 'existing' });
      await expect(
        service.register({ email: 'test@test.com', password: 'Test@1234', fullName: 'Test' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login with valid credentials', async () => {
      const hash = await bcrypt.hash('Test@1234', 12);
      const user = { id: 'user-1', email: 'test@test.com', passwordHash: hash, fullName: 'Test', role: 'CUSTOMER', isActive: true, organizationId: null };
      mockUserRepo.findOne.mockResolvedValue(user);
      mockUserRepo.save.mockResolvedValue(user);
      mockRefreshTokenRepo.create.mockReturnValue({});
      mockRefreshTokenRepo.save.mockResolvedValue({});

      const result = await service.login({ email: 'test@test.com', password: 'Test@1234' });
      expect(result.accessToken).toBeDefined();
      expect(result.refreshToken).toBeDefined();
    });

    it('should reject invalid email', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(
        service.login({ email: 'bad@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject wrong password', async () => {
      const hash = await bcrypt.hash('correct', 12);
      mockUserRepo.findOne.mockResolvedValue({ id: '1', passwordHash: hash, isActive: true });
      await expect(
        service.login({ email: 'test@test.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should reject inactive user', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1', isActive: false });
      await expect(
        service.login({ email: 'test@test.com', password: 'Test@1234' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('getProfile', () => {
    it('should return user profile without password', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1', email: 'test@test.com', passwordHash: 'hash', fullName: 'Test' });
      const result = await service.getProfile('1');
      expect(result).not.toHaveProperty('passwordHash');
      expect(result).toHaveProperty('email');
    });

    it('should throw NotFoundException for missing user', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile('missing')).rejects.toThrow();
    });
  });
});
