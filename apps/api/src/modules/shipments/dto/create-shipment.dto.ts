import {
  IsNotEmpty, IsObject, IsOptional, IsString, IsEnum, IsNumber,
  IsUUID, Min, IsInt,
} from 'class-validator';
import { ServiceType } from '@vttm/shared';

export class CreateShipmentDto {
  @IsNotEmpty()
  @IsUUID()
  orderId: string;

  @IsNotEmpty()
  @IsObject()
  senderAddress: Record<string, any>;

  @IsNotEmpty()
  @IsObject()
  recipientAddress: Record<string, any>;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsObject()
  dimensions?: { lengthCm: number; widthCm: number; heightCm: number };

  @IsOptional()
  @IsInt()
  @Min(1)
  pieceCount?: number;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  shippingCost?: number;
}
