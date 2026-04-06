import { IsOptional, IsString } from 'class-validator';

export class QueryGeoDto {
  @IsOptional()
  @IsString()
  q?: string;

  @IsOptional()
  @IsString()
  provinceCode?: string;

  @IsOptional()
  @IsString()
  districtCode?: string;
}
