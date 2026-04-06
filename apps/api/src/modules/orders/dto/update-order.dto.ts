import { IsOptional, IsObject, IsString, IsEnum, IsNumber, Min } from 'class-validator';
import { OrderStatus, ServiceType, PaymentMethod } from '@vttm/shared';

export class UpdateOrderDto {
  @IsOptional()
  @IsObject()
  senderAddress?: Record<string, any>;

  @IsOptional()
  @IsObject()
  recipientAddress?: Record<string, any>;

  @IsOptional()
  @IsString()
  customerPhone?: string;

  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;

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
}
