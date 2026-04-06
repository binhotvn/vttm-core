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
import { UserRole } from '@vttm/shared';
import { Organization } from '../../organizations/entities/organization.entity';

@Entity('users')
@Index(['organizationId', 'role'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @Column({ nullable: true })
  phone: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.CUSTOMER })
  role: UserRole;

  @ManyToOne(() => Organization, { nullable: true, onDelete: 'SET NULL' })
  organization: Organization;

  @Column('uuid', { nullable: true })
  @Index()
  organizationId: string;

  @Column({ type: 'varchar', length: 5, default: 'vi' })
  locale: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamptz', nullable: true })
  lastLoginAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt: Date;
}
