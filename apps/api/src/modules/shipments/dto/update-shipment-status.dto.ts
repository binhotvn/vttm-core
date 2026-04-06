import { IsNotEmpty, IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { ShipmentStatus } from '@vttm/shared';

export class UpdateShipmentStatusDto {
  @IsNotEmpty()
  @IsEnum(ShipmentStatus)
  status: ShipmentStatus;

  @IsOptional()
  @IsString()
  reason?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsObject()
  geoLocation?: { lat: number; lng: number };

  @IsOptional()
  @IsString()
  hubId?: string;
}
