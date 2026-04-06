import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { BadRequestException } from '@nestjs/common';
import { PickupService } from '../pickup.service';
import { PickupRequest } from '../entities/pickup-request.entity';
import { PickupStatus } from '@vttm/shared';

const mockRepo = {
  findAndCount: jest.fn(), findOne: jest.fn(), create: jest.fn(),
  save: jest.fn(), count: jest.fn().mockResolvedValue(0),
};

describe('PickupService', () => {
  let service: PickupService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PickupService,
        { provide: getRepositoryToken(PickupRequest), useValue: mockRepo },
      ],
    }).compile();
    service = module.get<PickupService>(PickupService);
    jest.clearAllMocks();
    mockRepo.count.mockResolvedValue(0);
  });

  it('should return time slots', () => {
    const slots = service.getTimeSlots();
    expect(slots).toHaveLength(3);
    expect(slots[0].label).toContain('Sáng');
    expect(slots[1].label).toContain('Chiều');
    expect(slots[2].label).toContain('Tối');
  });

  it('should create a pickup request', async () => {
    mockRepo.create.mockReturnValue({ id: 'p1', pickupNumber: 'PU-001', status: 'REQUESTED' });
    mockRepo.save.mockResolvedValue({ id: 'p1', pickupNumber: 'PU-001', status: 'REQUESTED' });

    const result = await service.create({
      pickupAddress: { contactName: 'A', phone: '0901234567', country: 'VN', streetAddress: '123' },
      contactInfo: { name: 'A', phone: '0901234567' },
      requestedDate: '2026-04-06T08:00:00Z',
    }, 'org-1');
    expect(result.status).toBe('REQUESTED');
  });

  it('should assign a driver', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'p1', status: PickupStatus.REQUESTED });
    mockRepo.save.mockImplementation((p: any) => p);

    const result = await service.assign('p1', 'driver-1');
    expect(result.status).toBe(PickupStatus.DRIVER_ASSIGNED);
    expect(result.assignedDriverId).toBe('driver-1');
  });

  it('should not cancel a completed pickup', async () => {
    mockRepo.findOne.mockResolvedValue({ id: 'p1', status: PickupStatus.COMPLETED });
    await expect(service.cancel('p1')).rejects.toThrow(BadRequestException);
  });
});
