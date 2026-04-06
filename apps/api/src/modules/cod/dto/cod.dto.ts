import { IsNotEmpty, IsUUID, IsNumber, IsOptional, IsString, IsDateString, Min } from 'class-validator';

export class VerifyCodDto {
  @IsNotEmpty()
  @IsUUID()
  driverId: string;

  @IsNotEmpty()
  @IsDateString()
  date: string;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  actualTotal: number;
}

export class ProcessTransferDto {
  @IsNotEmpty()
  @IsUUID()
  senderId: string;

  @IsOptional()
  @IsString()
  bankTransferRef?: string;
}
