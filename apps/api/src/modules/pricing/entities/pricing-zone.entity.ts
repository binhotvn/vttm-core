import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('pricing_zones')
@Index(['organizationId', 'code'], { unique: true })
export class PricingZone {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  organizationId: string;

  @Column()
  name: string;

  @Column()
  nameEn: string;

  @Column()
  code: string;

  @Column({ type: 'varchar', array: true, default: '{}' })
  provinceCodes: string[];

  @Column({ type: 'varchar', array: true, nullable: true })
  districtCodes: string[];

  @Column({ default: false })
  isRemote: boolean;

  @Column({ type: 'int', default: 72 })
  slaHours: number;

  @CreateDateColumn()
  createdAt: Date;
}
