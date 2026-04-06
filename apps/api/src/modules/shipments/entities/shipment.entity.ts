import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, DeleteDateColumn, Index,
} from 'typeorm';
import { ShipmentStatus, ServiceType } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { Order } from '../../orders/entities/order.entity';
import { Hub } from '../../hubs/entities/hub.entity';

export enum ShipmentPriority {
  LOW = 'LOW',
  NORMAL = 'NORMAL',
  HIGH = 'HIGH',
  URGENT = 'URGENT',
}

@Entity('shipments')
@Index(['organizationId', 'status'])
@Index(['organizationId', 'createdAt'])
export class Shipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  trackingNumber: string;

  @Column({ nullable: true })
  barcode: string;

  @ManyToOne(() => Order, { onDelete: 'CASCADE' })
  order: Order;

  @Column('uuid')
  orderId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column({ type: 'enum', enum: ShipmentStatus, default: ShipmentStatus.LABEL_CREATED })
  status: ShipmentStatus;

  @Column({ type: 'enum', enum: ShipmentStatus, nullable: true })
  previousStatus: ShipmentStatus;

  @Column({ type: 'enum', enum: ShipmentPriority, default: ShipmentPriority.NORMAL })
  priority: ShipmentPriority;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  weightKg: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  volumetricWeightKg: number;

  @Column({ type: 'jsonb', nullable: true })
  dimensions: { lengthCm: number; widthCm: number; heightCm: number };

  @Column({ type: 'int', default: 1 })
  pieceCount: number;

  @Column({ type: 'jsonb' })
  senderAddress: Record<string, any>;

  @Column({ type: 'jsonb' })
  recipientAddress: Record<string, any>;

  @Column({ type: 'enum', enum: ServiceType, default: ServiceType.STANDARD })
  serviceType: ServiceType;

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  currentHub: Hub;

  @Column('uuid', { nullable: true })
  @Index()
  currentHubId: string;

  @Column('uuid', { nullable: true })
  originHubId: string;

  @Column('uuid', { nullable: true })
  destinationHubId: string;

  @Column('uuid', { nullable: true })
  @Index()
  assignedDriverId: string;

  @Column('uuid', { nullable: true })
  @Index()
  batchId: string;

  @Column('uuid', { nullable: true })
  routeId: string;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  shippingCost: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  codAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  codFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  insuranceAmount: number;

  @Column({ type: 'jsonb', default: [] })
  surcharges: Array<{ type: string; amount: number; label: string }>;

  @Column({ type: 'timestamptz', nullable: true })
  estimatedDeliveryDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualDeliveryDate: Date;

  @Column({ type: 'timestamptz', nullable: true })
  pickedUpAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  proofOfDelivery: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  deliveryAttempts: number;

  @Column({ type: 'int', default: 3 })
  maxDeliveryAttempts: number;

  @Column({ type: 'text', nullable: true })
  exceptionReason: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
