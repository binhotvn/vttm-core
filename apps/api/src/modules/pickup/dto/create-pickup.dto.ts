import { IsNotEmpty, IsObject, IsOptional, IsString, IsNumber, IsDateString, Min } from 'class-validator';

export class CreatePickupDto {
  @IsNotEmpty()
  @IsObject()
  pickupAddress: Record<string, any>;

  @IsNotEmpty()
  @IsObject()
  contactInfo: { name: string; phone: string };

  @IsNotEmpty()
  @IsDateString()
  requestedDate: string;

  @IsOptional()
  @IsObject()
  timeSlot?: { start: string; end: string; label: string };

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedPieceCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  estimatedWeightKg?: number;

  @IsOptional()
  @IsString()
  specialInstructions?: string;
}
