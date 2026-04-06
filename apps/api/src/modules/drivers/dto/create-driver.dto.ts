import { IsUUID, IsOptional, IsString, IsEnum, IsObject } from 'class-validator';
import { DriverStatus } from '@vttm/shared';

export class CreateDriverDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsUUID()
  homeHubId?: string;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;

  @IsOptional()
  @IsObject()
  bankAccount?: Record<string, any>;
}

export class UpdateDriverDto {
  @IsOptional()
  @IsEnum(DriverStatus)
  status?: DriverStatus;

  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsUUID()
  homeHubId?: string;

  @IsOptional()
  @IsObject()
  capabilities?: Record<string, any>;

  @IsOptional()
  @IsObject()
  schedule?: Record<string, any>;

  @IsOptional()
  @IsObject()
  bankAccount?: Record<string, any>;
}

export class UpdateLocationDto {
  lat: number;
  lng: number;
}
