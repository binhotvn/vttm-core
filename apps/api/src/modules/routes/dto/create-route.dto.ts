import { IsNotEmpty, IsOptional, IsUUID, IsArray, ValidateNested, IsEnum, IsNumber, IsObject } from 'class-validator';
import { Type } from 'class-transformer';
import { StopType } from '@vttm/shared';

export class CreateRouteStopDto {
  @IsNotEmpty()
  @IsEnum(StopType)
  type: StopType;

  @IsOptional()
  @IsUUID()
  shipmentId?: string;

  @IsNotEmpty()
  @IsObject()
  address: Record<string, any>;

  @IsOptional()
  geoLocation?: { lat: number; lng: number };

  @IsOptional()
  notes?: string;
}

export class CreateRouteDto {
  @IsOptional()
  @IsUUID()
  driverId?: string;

  @IsOptional()
  @IsUUID()
  startHubId?: string;

  @IsOptional()
  plannedStartTime?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRouteStopDto)
  stops: CreateRouteStopDto[];
}
