import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn,
} from 'typeorm';
import { ServiceType } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';

export enum PricingMethod {
  FLAT_RATE = 'FLAT_RATE',
  PER_KG = 'PER_KG',
  TIERED = 'TIERED',
  ZONE_MATRIX = 'ZONE_MATRIX',
}

@Entity('pricing_rules')
export class PricingRule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column()
  name: string;

  @Column({ type: 'enum', enum: ServiceType })
  serviceType: ServiceType;

  @Column({ type: 'jsonb', default: {} })
  conditions: {
    originZoneCode?: string;
    destinationZoneCode?: string;
    minWeightKg?: number;
    maxWeightKg?: number;
  };

  @Column({ type: 'enum', enum: PricingMethod })
  method: PricingMethod;

  @Column({ type: 'jsonb' })
  rates: {
    baseRate: number;
    perKgRate?: number;
    tiers?: Array<{ minKg: number; maxKg: number; rate: number }>;
  };

  @Column({ type: 'int', default: 0 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
