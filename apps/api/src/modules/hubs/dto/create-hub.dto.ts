import { IsNotEmpty, IsString, IsOptional, IsObject, IsArray, IsNumber, IsUUID } from 'class-validator';

export class CreateHubDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  code: string;

  @IsNotEmpty()
  @IsString()
  type: string;

  @IsObject()
  address: Record<string, any>;

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
