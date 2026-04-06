import { Controller, Get, Param, Query } from '@nestjs/common';
import { GeoService } from './geo.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('geo')
@Public()
export class GeoController {
  constructor(private readonly geoService: GeoService) {}

  @Get('provinces')
  findAllProvinces() {
    return this.geoService.findAllProvinces();
  }

  @Get('provinces/:code')
  findProvinceByCode(@Param('code') code: string) {
    return this.geoService.findProvinceByCode(code);
  }

  @Get('provinces/:code/districts')
  findDistrictsByProvince(@Param('code') code: string) {
    return this.geoService.findDistrictsByProvince(code);
  }

  @Get('districts/:code')
  findDistrictByCode(@Param('code') code: string) {
    return this.geoService.findDistrictByCode(code);
  }

  @Get('districts/:code/wards')
  findWardsByDistrict(@Param('code') code: string) {
    return this.geoService.findWardsByDistrict(code);
  }

  @Get('wards/:code')
  findWardByCode(@Param('code') code: string) {
    return this.geoService.findWardByCode(code);
  }

  @Get('search')
  search(@Query('q') q: string) {
    return this.geoService.search(q || '');
  }
}
