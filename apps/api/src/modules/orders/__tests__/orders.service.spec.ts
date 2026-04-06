import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { OrdersService } from '../orders.service';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

const mockOrderRepo = {
  findAndCount: jest.fn(),
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  count: jest.fn().mockResolvedValue(0),
  softRemove: jest.fn(),
};

const mockItemRepo = {
  create: jest.fn((dto: any) => dto),
};

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: getRepositoryToken(Order), useValue: mockOrderRepo },
        { provide: getRepositoryToken(OrderItem), useValue: mockItemRepo },
      ],
    }).compile();
    service = module.get<OrdersService>(OrdersService);
    jest.clearAllMocks();
    mockOrderRepo.count.mockResolvedValue(0);
  });

  describe('create', () => {
    it('should create an order with auto-generated number', async () => {
      const order = {
        id: 'ord-1', orderNumber: 'ORD-20260405-0001', status: 'CONFIRMED',
        items: [{ description: 'Shirt', quantity: 2, declaredValue: 100000 }],
        codAmount: 200000,
      };
      mockOrderRepo.create.mockReturnValue(order);
      mockOrderRepo.save.mockResolvedValue(order);

      const result = await service.create(
        { senderAddress: { contactName: 'A', phone: '0901234567', country: 'VN', streetAddress: '123' },
          recipientAddress: { contactName: 'B', phone: '0987654321', country: 'VN', streetAddress: '456' },
          codAmount: 200000,
          items: [{ description: 'Shirt', quantity: 2, declaredValue: 100000 }],
        }, 'org-1', 'user-1',
      );
      expect(result.orderNumber).toMatch(/^ORD-/);
      expect(mockOrderRepo.save).toHaveBeenCalled();
    });

    it('should normalize recipient phone', async () => {
      mockOrderRepo.create.mockImplementation((data: any) => data);
      mockOrderRepo.save.mockImplementation((data: any) => data);

      await service.create(
        { senderAddress: { contactName: 'A', phone: '0901234567', country: 'VN', streetAddress: '1' },
          recipientAddress: { contactName: 'B', phone: '0987654321', country: 'VN', streetAddress: '2' },
          customerPhone: '0901234567',
        }, 'org-1',
      );
      expect(mockOrderRepo.create).toHaveBeenCalledWith(
        expect.objectContaining({ customerPhone: '+84901234567' }),
      );
    });
  });

  describe('findOne', () => {
    it('should find order by id', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: 'ord-1', orderNumber: 'ORD-001' });
      const result = await service.findOne('ord-1');
      expect(result.orderNumber).toBe('ORD-001');
    });

    it('should throw NotFoundException', async () => {
      mockOrderRepo.findOne.mockResolvedValue(null);
      await expect(service.findOne('missing')).rejects.toThrow(NotFoundException);
    });
  });

  describe('confirm', () => {
    it('should set status to CONFIRMED', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: '1', status: 'DRAFT', items: [] });
      mockOrderRepo.save.mockImplementation((o: any) => o);
      const result = await service.confirm('1');
      expect(result.status).toBe('CONFIRMED');
    });
  });

  describe('cancel', () => {
    it('should set status to CANCELLED', async () => {
      mockOrderRepo.findOne.mockResolvedValue({ id: '1', status: 'CONFIRMED', items: [] });
      mockOrderRepo.save.mockImplementation((o: any) => o);
      const result = await service.cancel('1');
      expect(result.status).toBe('CANCELLED');
    });
  });

  describe('createBulk', () => {
    it('should create multiple orders and collect errors', async () => {
      let callCount = 0;
      mockOrderRepo.create.mockImplementation((d: any) => ({ ...d, id: `ord-${++callCount}`, orderNumber: `ORD-${callCount}`, items: [] }));
      mockOrderRepo.save.mockImplementation((d: any) => d);

      const orders = [
        { senderAddress: { contactName: 'A', phone: '0901234567', country: 'VN', streetAddress: '1' },
          recipientAddress: { contactName: 'B', phone: '0987654321', country: 'VN', streetAddress: '2' } },
        { senderAddress: { contactName: 'C', phone: '0901234567', country: 'VN', streetAddress: '3' },
          recipientAddress: { contactName: 'D', phone: '0987654321', country: 'VN', streetAddress: '4' } },
      ];
      const result = await service.createBulk(orders, 'org-1');
      expect(result.created).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });
});
