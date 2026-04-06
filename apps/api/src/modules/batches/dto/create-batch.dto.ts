import { IsNotEmpty, IsString, IsEnum, IsOptional, IsUUID, IsArray } from 'class-validator';
import { BatchType } from '@vttm/shared';

export class CreateBatchDto {
  @IsNotEmpty()
  @IsEnum(BatchType)
  type: BatchType;

  @IsOptional()
  @IsUUID()
  originHubId?: string;

  @IsOptional()
  @IsUUID()
  destinationHubId?: string;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  shipmentIds?: string[];
}

export class SealBatchDto {
  @IsNotEmpty()
  @IsString()
  sealNumber: string;
}

export class SplitBatchDto {
  @IsNotEmpty()
  @IsString()
  strategy: 'DISTRICT' | 'ZONE' | 'CAPACITY' | 'SERVICE_TYPE' | 'MANUAL';

  @IsOptional()
  maxWeightKg?: number;

  @IsOptional()
  maxCount?: number;

  @IsOptional()
  @IsArray()
  shipmentIds?: string[];
}
