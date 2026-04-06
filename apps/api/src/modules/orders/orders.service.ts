import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationDto } from '../../common/pipes/parse-pagination.pipe';
import { normalizeVnPhone } from '@vttm/shared';
import { OrderStatus } from '@vttm/shared';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepo: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepo: Repository<OrderItem>,
  ) {}

  private async generateOrderNumber(): Promise<string> {
    const now = new Date();
    const date = `${now.getFullYear()}${String(now.getMonth() + 1).padStart(2, '0')}${String(now.getDate()).padStart(2, '0')}`;
    const count = await this.orderRepo.count();
    const seq = String(count + 1).padStart(4, '0');
    return `ORD-${date}-${seq}`;
  }

  async findAll(pagination: PaginationDto, organizationId?: string, status?: string) {
    const where: FindOptionsWhere<Order> = {};
    if (organizationId) where.organizationId = organizationId;
    if (status) where.status = status as OrderStatus;

    const [data, total] = await this.orderRepo.findAndCount({
      where,
      order: { [pagination.sortBy || 'createdAt']: pagination.sortOrder || 'DESC' },
      skip: (pagination.page - 1) * pagination.limit,
      take: pagination.limit,
      relations: ['items'],
    });

    return {
      data,
      meta: {
        total,
        page: pagination.page,
        limit: pagination.limit,
        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findOne(id: string) {
    const order = await this.orderRepo.findOne({
      where: { id },
      relations: ['items'],
    });
    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async create(dto: CreateOrderDto, organizationId: string, customerId?: string) {
    const orderNumber = await this.generateOrderNumber();

    const phone = dto.customerPhone ? normalizeVnPhone(dto.customerPhone) : undefined;
    const recipientPhone = dto.recipientAddress?.phone
      ? normalizeVnPhone(dto.recipientAddress.phone)
      : undefined;

    const order = this.orderRepo.create({
      orderNumber,
      organizationId,
      customerId,
      senderAddress: dto.senderAddress,
      recipientAddress: recipientPhone
        ? { ...dto.recipientAddress, phone: recipientPhone }
        : dto.recipientAddress,
      customerPhone: phone,
      customerEmail: dto.customerEmail,
      serviceType: dto.serviceType,
      paymentMethod: dto.paymentMethod,
      codAmount: dto.codAmount || 0,
      specialInstructions: dto.specialInstructions,
      status: OrderStatus.CONFIRMED,
      items: dto.items?.map((item) => this.orderItemRepo.create(item)) || [],
    });

    // Calculate total from items
    if (order.items.length > 0) {
      order.totalAmount = order.items.reduce(
        (sum, item) => sum + Number(item.declaredValue || 0) * (item.quantity || 1),
        0,
      );
    }

    return this.orderRepo.save(order);
  }

  async createBulk(orders: CreateOrderDto[], organizationId: string, customerId?: string) {
    const results: { created: Order[]; errors: { index: number; error: string }[] } = {
      created: [],
      errors: [],
    };

    for (let i = 0; i < orders.length; i++) {
      try {
        const order = await this.create(orders[i], organizationId, customerId);
        results.created.push(order);
      } catch (err: any) {
        results.errors.push({ index: i, error: err.message });
      }
    }

    return results;
  }

  async update(id: string, dto: UpdateOrderDto) {
    const order = await this.findOne(id);
    Object.assign(order, dto);
    return this.orderRepo.save(order);
  }

  async confirm(id: string) {
    const order = await this.findOne(id);
    order.status = OrderStatus.CONFIRMED;
    return this.orderRepo.save(order);
  }

  async cancel(id: string) {
    const order = await this.findOne(id);
    order.status = OrderStatus.CANCELLED;
    return this.orderRepo.save(order);
  }

  async remove(id: string) {
    const order = await this.findOne(id);
    await this.orderRepo.softRemove(order);
  }
}
