import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index,
} from 'typeorm';
import { OrderStatus, ServiceType, PaymentMethod } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { OrderItem } from './order-item.entity';

@Entity('orders')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'createdAt'])
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  orderNumber: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  customer: User;

  @Column('uuid', { nullable: true })
  customerId: string;

  @Column({ type: 'jsonb' })
  senderAddress: Record<string, any>;

  @Column({ type: 'jsonb' })
  recipientAddress: Record<string, any>;

  @Column({ nullable: true })
  customerPhone: string;

  @Column({ nullable: true })
  customerEmail: string;

  @Column({ type: 'enum', enum: OrderStatus, default: OrderStatus.DRAFT })
  status: OrderStatus;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.STANDARD })
  serviceType: ServiceType;

  @Column({ type: 'enum', enum: PaymentMethod, default: PaymentMethod.PREPAID })
  paymentMethod: PaymentMethod;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  totalAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  codAmount: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
