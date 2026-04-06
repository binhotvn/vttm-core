import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, Index,
} from 'typeorm';
import { Shipment } from '../../shipments/entities/shipment.entity';

export enum DeliveryAttemptResult {
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  PARTIAL = 'PARTIAL',
}

@Entity('delivery_attempts')
@Index(['shipmentId', 'attemptNumber'])
export class DeliveryAttempt {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  shipment: Shipment;

  @Column('uuid')
  shipmentId: string;

  @Column({ type: 'int' })
  attemptNumber: number;

  @Column('uuid', { nullable: true })
  driverId: string;

  @Column({ type: 'enum', enum: DeliveryAttemptResult })
  result: DeliveryAttemptResult;

  @Column({ nullable: true })
  failureReasonCode: string;

  @Column({ type: 'text', nullable: true })
  failureNotes: string;

  @Column({ type: 'jsonb', nullable: true })
  photoUrls: string[];

  @Column({ type: 'jsonb', nullable: true })
  geoLocation: { lat: number; lng: number };

  @Column({ type: 'timestamptz' })
  attemptedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  rescheduledTo: Date;

  @CreateDateColumn()
  createdAt: Date;
}
