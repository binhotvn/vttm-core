import { IsNotEmpty, IsString, IsNumber, IsEnum, Min } from 'class-validator';
import { ServiceType } from '@vttm/shared';

export class CalculatePriceDto {
  @IsNotEmpty()
  @IsString()
  originProvinceCode: string;

  @IsNotEmpty()
  @IsString()
  destinationProvinceCode: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  weightKg: number;

  @IsNotEmpty()
  @IsEnum(ServiceType)
  serviceType: ServiceType;
}
