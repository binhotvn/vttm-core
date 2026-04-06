import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import { UserRole } from '@vttm/shared';
import { User } from '../users/entities/user.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtPayload } from '../../common/interfaces/request-with-user.interface';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepo: Repository<User>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepo: Repository<RefreshToken>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.userRepo.findOne({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Email already registered');
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);
    const user = this.userRepo.create({
      email: dto.email,
      passwordHash,
      fullName: dto.fullName,
      phone: dto.phone,
      role: UserRole.CUSTOMER,
    });
    await this.userRepo.save(user);

    return this.generateTokenPair(user);
  }

  async login(dto: LoginDto, userAgent?: string, ipAddress?: string) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['organization'],
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    user.lastLoginAt = new Date();
    await this.userRepo.save(user);

    return this.generateTokenPair(user, userAgent, ipAddress);
  }

  async refreshTokens(refreshTokenStr: string) {
    const tokenHash = await this.hashToken(refreshTokenStr);
    const storedToken = await this.refreshTokenRepo.findOne({
      where: {
        tokenHash,
        isRevoked: false,
        expiresAt: MoreThan(new Date()),
      },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Revoke old token
    storedToken.isRevoked = true;
    await this.refreshTokenRepo.save(storedToken);

    const user = await this.userRepo.findOne({
      where: { id: storedToken.userId },
      relations: ['organization'],
    });
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User not found or disabled');
    }

    return this.generateTokenPair(user);
  }

  async logout(refreshTokenStr: string) {
    const tokenHash = await this.hashToken(refreshTokenStr);
    await this.refreshTokenRepo.update({ tokenHash }, { isRevoked: true });
  }

  async getProfile(userId: string) {
    const user = await this.userRepo.findOne({
      where: { id: userId },
      relations: ['organization'],
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }

  private async generateTokenPair(user: User, userAgent?: string, ipAddress?: string) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId || null,
    };

    const accessToken = this.jwtService.sign(payload as any, {
      secret: this.configService.get<string>('jwt.accessSecret')!,
      expiresIn: this.configService.get<string>('jwt.accessExpiration')! as any,
    });

    const refreshTokenStr = uuidv4();
    const tokenHash = await this.hashToken(refreshTokenStr);

    const refreshToken = this.refreshTokenRepo.create({
      tokenHash,
      userId: user.id,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      userAgent,
      ipAddress,
    });
    await this.refreshTokenRepo.save(refreshToken);

    return {
      accessToken,
      refreshToken: refreshTokenStr,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        organizationId: user.organizationId,
      },
    };
  }

  private async hashToken(token: string): Promise<string> {
    return bcrypt.hash(token, 10);
  }
}
