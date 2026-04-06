import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('hubs')
@Index(['organizationId', 'code'], { unique: true })
export class Hub {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  code: string;

  @Column({ type: 'varchar', length: 30 })
  type: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'jsonb' })
  address: Record<string, any>;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'Point',
    srid: 4326,
    nullable: true,
  })
  location: any;

  @Column({ type: 'varchar', array: true, default: '{}' })
  serviceDistrictCodes: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ nullable: true })
  contactPhone: string;

  @Column({ nullable: true })
  contactName: string;

  @Column({ type: 'int', nullable: true })
  capacity: number;

  @Column('uuid', { nullable: true })
  parentHubId: string;

  @ManyToOne(() => Hub, { nullable: true })
  parentHub: Hub;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
