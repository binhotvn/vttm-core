import {
  IsNotEmpty, IsObject, IsOptional, IsString, IsEnum, IsNumber,
  IsArray, ValidateNested, Min, IsEmail, IsBoolean,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ServiceType, PaymentMethod } from '@vttm/shared';

export class CreateOrderItemDto {
  @IsNotEmpty()
  @IsString()
  description: string;

  @IsOptional()
  @IsNumber()
  @Min(1)
  quantity?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  weightKg?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  declaredValue?: number;

  @IsOptional()
  @IsBoolean()
  isFragile?: boolean;

  @IsOptional()
  @IsBoolean()
  isDangerous?: boolean;
}

export class CreateOrderDto {
  @IsNotEmpty()
  @IsObject()
  senderAddress: Record<string, any>;

  @IsNotEmpty()
  @IsObject()
  recipientAddress: Record<string, any>;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @IsOptional()
  @IsEnum(ServiceType)
  serviceType?: ServiceType;

  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod;

  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateOrderItemDto)
  items?: CreateOrderItemDto[];
}
