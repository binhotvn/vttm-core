import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { ReturnStatus, ReturnReason } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('return_requests')
export class ReturnRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  returnNumber: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  originalShipment: Shipment;

  @Column('uuid')
  originalShipmentId: string;

  @ManyToOne(() => Shipment, { nullable: true, onDelete: 'SET NULL' })
  returnShipment: Shipment;

  @Column('uuid', { nullable: true })
  returnShipmentId: string;

  @Column({ type: 'enum', enum: ReturnStatus, default: ReturnStatus.REQUESTED })
  status: ReturnStatus;

  @Column({ type: 'enum', enum: ReturnReason })
  reason: ReturnReason;

  @Column({ type: 'decimal', precision: 15, scale: 0, default: 0 })
  returnFee: number;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
