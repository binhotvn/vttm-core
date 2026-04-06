import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne,
  CreateDateColumn, Index,
} from 'typeorm';
import { WebhookEndpoint } from './webhook-endpoint.entity';

@Entity('webhook_logs')
@Index(['endpointId'])
export class WebhookLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => WebhookEndpoint, { onDelete: 'CASCADE' })
  endpoint: WebhookEndpoint;

  @Column('uuid')
  endpointId: string;

  @Column()
  event: string;

  @Column({ type: 'jsonb' })
  payload: Record<string, any>;

  @Column({ type: 'int', nullable: true })
  responseStatus: number;

  @Column({ type: 'text', nullable: true })
  responseBody: string;

  @Column({ default: false })
  success: boolean;

  @Column({ type: 'int', default: 1 })
  attempts: number;

  @Column({ type: 'text', nullable: true })
  error: string;

  @CreateDateColumn()
  createdAt: Date;
}
