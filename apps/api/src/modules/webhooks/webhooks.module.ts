import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookLog } from './entities/webhook-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WebhookEndpoint, WebhookLog])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
