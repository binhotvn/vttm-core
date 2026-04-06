import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotificationsService } from '../notifications.service';
import { Notification } from '../entities/notification.entity';

const mockRepo = {
  find: jest.fn(), findOne: jest.fn(), create: jest.fn(),
  save: jest.fn(), update: jest.fn(), count: jest.fn(),
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: getRepositoryToken(Notification), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  it('should send a notification', async () => {
    mockRepo.create.mockImplementation((d: any) => d);
    mockRepo.save.mockImplementation((d: any) => d);

    const result = await service.send({
      channel: 'SMS' as any, recipient: '+84901234567',
      titleVi: 'Test', bodyVi: 'Test body',
    });
    expect(result.status).toBe('SENT');
    expect(result.sentAt).toBeDefined();
  });

  it('should mark notification as read', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'n1', status: 'DELIVERED' });
    mockRepo.save.mockImplementation((n: any) => n);

    const result = await service.markRead('n1');
    expect(result.status).toBe('READ');
    expect(result.readAt).toBeDefined();
  });

  it('should send shipment update notification', async () => {
    mockRepo.create.mockImplementation((d: any) => d);
    mockRepo.save.mockImplementation((d: any) => d);

    const result = await service.sendShipmentUpdate('NW-001', '+84901234567', 'Đã giao', 'Delivered');
    expect(result.bodyVi).toContain('NW-001');
    expect(result.channel).toBe('SMS');
  });
});
