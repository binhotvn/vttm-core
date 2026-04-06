import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index,
} from 'typeorm';
import { Batch } from './batch.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { User } from '../../users/entities/user.entity';

@Entity('batch_shipments')
@Index(['batchId', 'shipmentId'], { unique: true })
export class BatchShipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Batch, (b) => b.batchShipments, { onDelete: 'CASCADE' })
  batch: Batch;

  @Column('uuid')
  batchId: string;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  shipment: Shipment;

  @Column('uuid')
  shipmentId: string;

  @Column({ type: 'int', nullable: true })
  sortOrder: number;

  @Column({ type: 'timestamptz', nullable: true })
  scannedInAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  scannedOutAt: Date;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  scannedBy: User;

  @Column('uuid', { nullable: true })
  scannedById: string;
}
