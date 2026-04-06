import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany,
  CreateDateColumn, UpdateDateColumn,
} from 'typeorm';
import { RouteStatus } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';
import { Driver } from '../../drivers/entities/driver.entity';
import { Hub } from '../../hubs/entities/hub.entity';
import { RouteStop } from './route-stop.entity';

@Entity('routes')
export class Route {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  routeNumber: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column({ type: 'enum', enum: RouteStatus, default: RouteStatus.PLANNED })
  status: RouteStatus;

  @ManyToOne(() => Driver, { nullable: true, onDelete: 'SET NULL' })
  driver: Driver;

  @Column('uuid', { nullable: true })
  driverId: string;

  @ManyToOne(() => Hub, { nullable: true, onDelete: 'SET NULL' })
  startHub: Hub;

  @Column('uuid', { nullable: true })
  startHubId: string;

  @Column({ type: 'timestamptz', nullable: true })
  plannedStartTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  actualStartTime: Date;

  @Column({ type: 'timestamptz', nullable: true })
  completedAt: Date;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  totalDistanceKm: number;

  @Column({ type: 'int', nullable: true })
  estimatedDurationMinutes: number;

  @OneToMany(() => RouteStop, (s) => s.route, { cascade: true, eager: true })
  stops: RouteStop[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
