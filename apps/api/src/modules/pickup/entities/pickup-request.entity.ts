import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { PickupStatus } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Driver } from '../../drivers/entities/driver.entity';

@Entity('pickup_requests')
@Index(['organizationId', 'status'])
export class PickupRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  pickupNumber: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  customer: User;

  @Column('uuid', { nullable: true })
  customerId: string;

  @Column({ type: 'enum', enum: PickupStatus, default: PickupStatus.REQUESTED })
  status: PickupStatus;

  @Column({ type: 'jsonb' })
  pickupAddress: Record<string, any>;

  @Column({ type: 'jsonb' })
  contactInfo: { name: string; phone: string };

  @Column({ type: 'timestamptz' })
  requestedDate: Date;

  @Column({ type: 'jsonb', nullable: true })
  timeSlot: { start: string; end: string; label: string };

  @ManyToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
  assignedDriver: Driver;

  @Column('uuid', { nullable: true })
  assignedDriverId: string;

  @Column({ type: 'int', default: 0 })
  estimatedPieceCount: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, default: 0 })
  estimatedWeightKg: number;

  @Column({ type: 'text', nullable: true })
  specialInstructions: string;

  @Column({ type: 'jsonb', nullable: true })
  confirmation: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
