import { IsNotEmpty, IsUUID, IsEnum, IsOptional, IsString } from 'class-validator';
import { ReturnReason } from '@vttm/shared';

export class CreateReturnDto {
  @IsNotEmpty()
  @IsUUID()
  originalShipmentId: string;

  @IsNotEmpty()
  @IsEnum(ReturnReason)
  reason: ReturnReason;

  @IsOptional()
  @IsString()
  notes?: string;
}
