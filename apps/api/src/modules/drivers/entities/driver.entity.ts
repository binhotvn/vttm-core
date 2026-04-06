import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { DriverStatus } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { User } from '../../users/entities/user.entity';
import { Hub } from '../../hubs/entities/hub.entity';

@Entity('drivers')
@Index(['organizationId', 'status'])
export class Driver {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;

  @Column('uuid', { unique: true })
  userId: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column({ type: 'enum', enum: DriverStatus, default: DriverStatus.AVAILABLE })
  status: DriverStatus;

  @Column({ nullable: true })
  licenseNumber: string;

  @Column({ type: 'jsonb', nullable: true })
  currentLocation: { lat: number; lng: number; updatedAt: string };

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  homeHub: Hub;

  @Column('uuid', { nullable: true })
  homeHubId: string;

  @Column({ type: 'jsonb', default: {} })
  capabilities: {
    vehicleType?: string;
    maxWeightKg?: number;
    licensePlate?: string;
    canHandleFragile?: boolean;
    deliveryZones?: string[];
  };

  @Column({ type: 'jsonb', default: {} })
  performanceMetrics: {
    totalDeliveries?: number;
    successRate?: number;
    averageRating?: number;
    onTimeRate?: number;
    todayDeliveries?: number;
    todayCodCollected?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  schedule: {
    workDays?: number[];
    startTime?: string;
    endTime?: string;
    maxShipmentsPerDay?: number;
  };

  @Column({ type: 'jsonb', nullable: true })
  bankAccount: {
    bankName?: string;
    accountNumber?: string;
    accountHolder?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
