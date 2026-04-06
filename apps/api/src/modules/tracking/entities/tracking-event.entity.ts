import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, Index,
} from 'typeorm';
import { ShipmentStatus } from '@vttm/shared';
import { Shipment } from '../../shipments/entities/shipment.entity';
import { Hub } from '../../hubs/entities/hub.entity';
import { User } from '../../users/entities/user.entity';

@Entity('tracking_events')
@Index(['shipmentId', 'timestamp'])
export class TrackingEvent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Shipment, { onDelete: 'CASCADE' })
  shipment: Shipment;

  @Column('uuid')
  shipmentId: string;

  @Column({ type: 'enum', enum: ShipmentStatus })
  status: ShipmentStatus;

  @Column()
  titleVi: string;

  @Column()
  titleEn: string;

  @Column({ type: 'text', nullable: true })
  descriptionVi: string;

  @Column({ type: 'text', nullable: true })
  descriptionEn: string;

  @Column({ nullable: true })
  location: string;

  @Column({ type: 'jsonb', nullable: true })
  geoLocation: { lat: number; lng: number };

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  hub: Hub;

  @Column('uuid', { nullable: true })
  hubId: string;

  @ManyToOne(() => User, { nullable: true, onDelete: 'SET NULL' })
  performedBy: User;

  @Column('uuid', { nullable: true })
  performedById: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamptz' })
  timestamp: Date;

  @Column({ default: true })
  isPublic: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
