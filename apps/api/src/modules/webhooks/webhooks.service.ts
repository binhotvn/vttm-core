import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { WebhookEndpoint } from './entities/webhook-endpoint.entity';
import { WebhookLog } from './entities/webhook-log.entity';
import { CreateWebhookDto, UpdateWebhookDto } from './dto/webhook.dto';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectRepository(WebhookEndpoint)
    private readonly endpointRepo: Repository<WebhookEndpoint>,
    @InjectRepository(WebhookLog)
    private readonly logRepo: Repository<WebhookLog>,
  ) {}

  async findAll(organizationId: string) {
    return this.endpointRepo.find({ where: { organizationId }, order: { createdAt: 'DESC' } });
  }

  async findOne(id: string) {
    const endpoint = await this.endpointRepo.findOne({ where: { id } });
    if (!endpoint) throw new NotFoundException('Webhook endpoint not found');
    return endpoint;
  }

  async create(dto: CreateWebhookDto, organizationId: string) {
    const secret = crypto.randomBytes(32).toString('hex');
    const endpoint = this.endpointRepo.create({
      ...dto,
      organizationId,
      secret,
    });
    return this.endpointRepo.save(endpoint);
  }

  async update(id: string, dto: UpdateWebhookDto) {
    const endpoint = await this.findOne(id);
    Object.assign(endpoint, dto);
    return this.endpointRepo.save(endpoint);
  }

  async remove(id: string) {
    const endpoint = await this.findOne(id);
    await this.endpointRepo.remove(endpoint);
  }

  /**
   * Deliver a webhook event to all matching endpoints for an organization.
   */
  async deliver(organizationId: string, event: string, payload: Record<string, any>) {
    const endpoints = await this.endpointRepo.find({
      where: { organizationId, isActive: true },
    });

    const matching = endpoints.filter((ep) => ep.events.includes(event) || ep.events.includes('*'));

    for (const ep of matching) {
      const signature = this.sign(JSON.stringify(payload), ep.secret);
      const log = this.logRepo.create({
        endpointId: ep.id,
        event,
        payload,
      });

      try {
        const response = await fetch(ep.url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Webhook-Signature': signature,
            'X-Webhook-Event': event,
          },
          body: JSON.stringify(payload),
          signal: AbortSignal.timeout(10000),
        });

        log.responseStatus = response.status;
        log.responseBody = await response.text().catch(() => '');
        log.success = response.ok;
      } catch (err: any) {
        log.success = false;
        log.error = err.message;
      }

      await this.logRepo.save(log);
    }
  }

  async getLogs(endpointId: string, limit = 20) {
    return this.logRepo.find({
      where: { endpointId },
      order: { createdAt: 'DESC' },
      take: limit,
    });
  }

  async test(id: string) {
    const endpoint = await this.findOne(id);
    await this.deliver(endpoint.organizationId, 'test', {
      event: 'test',
      message: 'Webhook test delivery',
      timestamp: new Date().toISOString(),
    });
    return { sent: true };
  }

  private sign(payload: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(payload).digest('hex');
  }
}
