import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';

@Entity('order_items')
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Order, (o) => o.items, { onDelete: 'CASCADE' })
  order: Order;

  @Column('uuid')
  orderId: string;

  @Column()
  description: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  weightKg: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  declaredValue: number;

  @Column({ default: false })
  isFragile: boolean;

  @Column({ default: false })
  isDangerous: boolean;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;
}
