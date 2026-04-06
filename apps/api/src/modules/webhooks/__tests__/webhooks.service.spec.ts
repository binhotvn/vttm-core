import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { WebhooksService } from '../webhooks.service';
import { WebhookEndpoint } from '../entities/webhook-endpoint.entity';
import { WebhookLog } from '../entities/webhook-log.entity';

const mockEndpointRepo = {
  find: jest.fn(), findOne: jest.fn(), create: jest.fn(),
  save: jest.fn(), remove: jest.fn(),
};
const mockLogRepo = {
  find: jest.fn(), create: jest.fn(), save: jest.fn(),
};

describe('WebhooksService', () => {
  let service: WebhooksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        WebhooksService,
        { provide: getRepositoryToken(WebhookEndpoint), useValue: mockEndpointRepo },
        { provide: getRepositoryToken(WebhookLog), useValue: mockLogRepo },
      ],
    }).compile();
    service = module.get<WebhooksService>(WebhooksService);
    jest.clearAllMocks();
  });

  it('should create webhook with auto-generated secret', async () => {
    mockEndpointRepo.create.mockImplementation((d: any) => d);
    mockEndpointRepo.save.mockImplementation((d: any) => d);

    const result = await service.create(
      { url: 'https://example.com/hook', events: ['shipment.delivered'] },
      'org-1',
    );
    expect(result.secret).toBeDefined();
    expect(result.secret.length).toBe(64); // 32 bytes hex
    expect(result.organizationId).toBe('org-1');
  });

  it('should find all webhooks for org', async () => {
    mockEndpointRepo.find.mockResolvedValue([{ id: 'w1' }]);
    const result = await service.findAll('org-1');
    expect(result).toHaveLength(1);
  });

  it('should remove webhook', async () => {
    mockEndpointRepo.findOne.mockResolvedValue({ id: 'w1' });
    await service.remove('w1');
    expect(mockEndpointRepo.remove).toHaveBeenCalled();
  });
});
