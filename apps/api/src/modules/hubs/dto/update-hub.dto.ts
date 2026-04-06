import { IsOptional, IsString, IsBoolean, IsObject, IsArray, IsNumber, IsUUID } from 'class-validator';

export class UpdateHubDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsObject()
  address?: Record<string, any>;

  @IsOptional()
  @IsNumber()
  lat?: number;

  @IsOptional()
  @IsNumber()
  lng?: number;

  @IsOptional()
  @IsArray()
  serviceDistrictCodes?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  contactName?: string;

  @IsOptional()
  @IsNumber()
  capacity?: number;

  @IsOptional()
  @IsUUID()
  parentHubId?: string;
}
