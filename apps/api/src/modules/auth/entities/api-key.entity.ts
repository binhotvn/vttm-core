import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('api_keys')
export class ApiKey {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ length: 12 })
  keyPrefix: string;

  @Column()
  keyHash: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  organization: Organization;

  @Column('uuid')
  @Index()
  organizationId: string;

  @Column({ type: 'simple-array', default: '' })
  scopes: string[];

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  expiresAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
