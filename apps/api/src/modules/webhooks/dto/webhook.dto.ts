import { IsNotEmpty, IsString, IsArray, IsOptional, IsBoolean, IsUrl } from 'class-validator';

export class CreateWebhookDto {
  @IsNotEmpty()
  @IsUrl()
  url: string;

  @IsNotEmpty()
  @IsArray()
  @IsString({ each: true })
  events: string[];
}

export class UpdateWebhookDto {
  @IsOptional()
  @IsUrl()
  url?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  events?: string[];

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
