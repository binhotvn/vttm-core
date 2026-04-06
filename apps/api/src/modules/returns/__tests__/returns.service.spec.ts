import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ReturnsService } from '../returns.service';
import { ReturnRequest } from '../entities/return-request.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

const mockReturnRepo = {
  findOne: jest.fn(), create: jest.fn(), save: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  createQueryBuilder: jest.fn(() => ({
    leftJoinAndSelect: jest.fn().mockReturnThis(),
    orderBy: jest.fn().mockReturnThis(),
    skip: jest.fn().mockReturnThis(),
    take: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getManyAndCount: jest.fn().mockResolvedValue([[], 0]),
  })),
};
const mockShipmentRepo = {
  findOne: jest.fn(), save: jest.fn(),
};

describe('ReturnsService', () => {
  let service: ReturnsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        ReturnsService,
        { provide: getRepositoryToken(ReturnRequest), useValue: mockReturnRepo },
        { provide: getRepositoryToken(Shipment), useValue: mockShipmentRepo },
      ],
    }).compile();
    service = module.get<ReturnsService>(ReturnsService);
    jest.clearAllMocks();
    mockReturnRepo.count.mockResolvedValue(0);
  });

  it('should create return with 50% fee', async () => {
    mockShipmentRepo.findOne.mockResolvedValue({ id: 's1', shippingCost: 30000, status: 'DELIVERED' });
    mockShipmentRepo.save.mockResolvedValue({});
    mockReturnRepo.create.mockImplementation((d: any) => d);
    mockReturnRepo.save.mockImplementation((d: any) => ({ ...d, id: 'r1' }));

    const result = await service.create({
      originalShipmentId: 's1', reason: 'RECIPIENT_REFUSED' as any,
    }, 'org-1');

    expect(result.returnFee).toBe(15000); // 50% of 30000
    expect(result.status).toBe('REQUESTED');
  });

  it('should update original shipment to RETURNED_TO_SENDER', async () => {
    mockShipmentRepo.findOne.mockResolvedValue({ id: 's1', shippingCost: 20000, status: 'DELIVERED' });
    mockShipmentRepo.save.mockImplementation((s: any) => s);
    mockReturnRepo.create.mockImplementation((d: any) => d);
    mockReturnRepo.save.mockImplementation((d: any) => d);

    await service.create({ originalShipmentId: 's1', reason: 'DAMAGED' as any }, 'org-1');
    expect(mockShipmentRepo.save).toHaveBeenCalledWith(
      expect.objectContaining({ status: 'RETURNED_TO_SENDER' }),
    );
  });

  it('should approve a return', async () => {
    mockReturnRepo.findOne.mockResolvedValue({ id: 'r1', status: 'REQUESTED' });
    mockReturnRepo.save.mockImplementation((r: any) => r);

    const result = await service.approve('r1');
    expect(result.status).toBe('APPROVED');
  });
});
