import { IsEmail, IsNotEmpty, IsString, IsOptional, IsEnum, IsUUID, MinLength } from 'class-validator';
import { UserRole } from '@vttm/shared';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsNotEmpty()
  @IsString()
  fullName: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;

  @IsOptional()
  @IsUUID()
  organizationId?: string;
}
