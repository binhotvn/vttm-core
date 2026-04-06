import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';

@Entity('organizations')
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  slug: string;

  @Column({ type: 'jsonb', default: {} })
  settings: {
    defaultLocale?: string;
    timezone?: string;
    codEnabled?: boolean;
    codFeePercent?: number;
    codMinFee?: number;
    codSettlementDays?: number;
    maxDeliveryAttempts?: number;
    autoAssignDrivers?: boolean;
    assignmentStrategy?: string;
    requireProofOfDelivery?: boolean;
    labelFormat?: string;
  };

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  contactEmail: string;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  logoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
