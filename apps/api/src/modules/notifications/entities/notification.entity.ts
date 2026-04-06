import {
  Entity, PrimaryGeneratedColumn, Column,
  CreateDateColumn, Index,
} from 'typeorm';

export enum NotificationChannel {
  SMS = 'SMS',
  ZALO = 'ZALO',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum NotificationStatus {
  PENDING = 'PENDING',
  SENT = 'SENT',
  DELIVERED = 'DELIVERED',
  FAILED = 'FAILED',
  READ = 'READ',
}

@Entity('notifications')
@Index(['userId', 'status'])
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid', { nullable: true })
  organizationId: string;

  @Column('uuid', { nullable: true })
  userId: string;

  @Column({ type: 'enum', enum: NotificationChannel })
  channel: NotificationChannel;

  @Column({ type: 'enum', enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Column()
  recipient: string;

  @Column({ nullable: true })
  titleVi: string;

  @Column({ nullable: true })
  titleEn: string;

  @Column({ type: 'text' })
  bodyVi: string;

  @Column({ type: 'text', nullable: true })
  bodyEn: string;

  @Column({ type: 'jsonb', default: {} })
  metadata: Record<string, any>;

  @Column({ type: 'timestamptz', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  readAt: Date;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
