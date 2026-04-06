import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, Index,
} from 'typeorm';
import { CodStatus, CodTransferStatus } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('cod_collections')
@Index(['organizationId', 'status'])
@Index(['driverId', 'collectedDate'])
@Index(['senderId', 'transferStatus'])
export class CodCollection {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  shipment: Shipment;

  @Column('uuid')
  shipmentId: string;

  @Column('uuid')
  driverId: string;

  @Column('uuid', { nullable: true })
  senderId: string;

  @Column({ type: 'decimal', precision: 15, scale: 0 })
  expectedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0 })
  collectedAmount: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  codFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  shippingFee: number;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  netTransferAmount: number;

  @Column({ type: 'date' })
  collectedDate: string;

  @Column({ type: 'enum', enum: CodStatus, default: CodStatus.COLLECTED })
  status: CodStatus;

  @Column({ type: 'enum', enum: CodTransferStatus, default: CodTransferStatus.PENDING })
  transferStatus: CodTransferStatus;

  @Column({ nullable: true })
  bankTransferRef: string;

  @Column({ type: 'timestamptz', nullable: true })
  transferredAt: Date;

  @Column({ type: 'text', nullable: true })
  discrepancyNote: string;

  @CreateDateColumn()
  createdAt: Date;
}
