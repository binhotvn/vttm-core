import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateNotifications1712300000020 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "notification_channel_enum" AS ENUM ('SMS', 'ZALO', 'EMAIL', 'PUSH', 'IN_APP')`);
    await queryRunner.query(`CREATE TYPE "notification_status_enum" AS ENUM ('PENDING', 'SENT', 'DELIVERED', 'FAILED', 'READ')`);

    await queryRunner.createTable(new Table({
      name: 'notifications',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'organizationId', type: 'uuid', isNullable: true },
        { name: 'userId', type: 'uuid', isNullable: true },
        { name: 'channel', type: 'notification_channel_enum', isNullable: false },
        { name: 'status', type: 'notification_status_enum', default: "'PENDING'" },
        { name: 'recipient', type: 'varchar', isNullable: false },
        { name: 'titleVi', type: 'varchar', isNullable: true },
        { name: 'titleEn', type: 'varchar', isNullable: true },
        { name: 'bodyVi', type: 'text', isNullable: false },
        { name: 'bodyEn', type: 'text', isNullable: true },
        { name: 'metadata', type: 'jsonb', default: "'{}'" },
        { name: 'sentAt', type: 'timestamptz', isNullable: true },
        { name: 'readAt', type: 'timestamptz', isNullable: true },
        { name: 'error', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['userId', 'status'] }));
    await queryRunner.createIndex('notifications', new TableIndex({ columnNames: ['organizationId'] }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('notifications');
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "notification_channel_enum"`);
  }
}
