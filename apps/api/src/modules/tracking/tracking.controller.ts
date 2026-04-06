import { Controller, Get, Param, Query } from '@nestjs/common';
import { TrackingService } from './tracking.service';
import { Public } from '../../common/decorators/public.decorator';

@Controller('tracking')
@Public()
export class TrackingController {
  constructor(private readonly trackingService: TrackingService) {}

  @Get(':trackingNumber')
  track(
    @Param('trackingNumber') trackingNumber: string,
    @Query('lang') lang?: string,
  ) {
    return this.trackingService.trackByNumber(trackingNumber, lang || 'vi');
  }

  @Get('multi')
  trackMultiple(
    @Query('numbers') numbers: string,
    @Query('lang') lang?: string,
  ) {
    const trackingNumbers = numbers.split(',').map((n) => n.trim()).filter(Boolean);
    return this.trackingService.trackMultiple(trackingNumbers, lang || 'vi');
  }
}
