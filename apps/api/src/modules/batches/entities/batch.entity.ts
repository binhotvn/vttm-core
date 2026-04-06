import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn, Index,
} from 'typeorm';
import { BatchStatus, BatchType } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { Hub } from '../../hubs/entities/hub.entity';
import { BatchShipment } from './batch-shipment.entity';

@Entity('batches')
@Index(['organizationId', 'status'])
export class Batch {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  batchNumber: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column({ type: 'enum', enum: BatchStatus, default: BatchStatus.OPEN })
  status: BatchStatus;

  @Column({ type: 'enum', enum: BatchType })
  type: BatchType;

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  originHub: Hub;

  @Column('uuid', { nullable: true })
  originHubId: string;

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  destinationHub: Hub;

  @Column('uuid', { nullable: true })
  destinationHubId: string;

  @Column('uuid', { nullable: true })
  assignedDriverId: string;

  @Column('uuid', { nullable: true })
  parentBatchId: string;

  @ManyToOne(() => Batch, { nullable: true, onDelete: 'SET NULL' })
  parentBatch: Batch;

  @Column({ type: 'int', default: 0 })
  shipmentCount: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: 0 })
  totalWeightKg: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  totalCodAmount: number;

  @Column({ nullable: true })
  sealNumber: string;

  @Column({ type: 'timestamptz', nullable: true })
  sealedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @OneToMany(() => BatchShipment, (bs) => bs.batch, { cascade: true })
  batchShipments: BatchShipment[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
