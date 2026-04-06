import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, Index,
} from 'typeorm';
import { StopType, StopStatus } from '@vttm/shared';
import { Route } from './route.entity';
import { Shipment } from '../../shipments/entities/shipment.entity';

@Entity('route_stops')
@Index(['routeId', 'sequenceNumber'])
export class RouteStop {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Route, (r) => r.stops, { onDelete: 'CASCADE' })
  route: Route;

  @Column('uuid')
  routeId: string;

  @Column({ type: 'int' })
  sequenceNumber: number;

  @Column({ type: 'enum', enum: StopType })
  type: StopType;

  @ManyToOne(() => Shipment, { nullable: true, onDelete: 'SET NULL' })
  shipment: Shipment;

  @Column('uuid', { nullable: true })
  shipmentId: string;

  @Column({ type: 'jsonb' })
  address: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  geoLocation: { lat: number; lng: number };

  @Column({ type: 'enum', enum: StopStatus, default: StopStatus.PENDING })
  status: StopStatus;

  @Column({ type: 'timestamptz', nullable: true })
  estimatedArrival: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualArrival: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;
}
