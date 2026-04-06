import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateWebhooks1712300000019 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(new Table({
      name: 'webhook_endpoints',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'organizationId', type: 'uuid', isNullable: false },
        { name: 'url', type: 'varchar', isNullable: false },
        { name: 'secret', type: 'varchar', isNullable: false },
        { name: 'events', type: 'text[]', default: "'{}'" },
        { name: 'isActive', type: 'boolean', default: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createForeignKey('webhook_endpoints', new TableForeignKey({ columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));

    await queryRunner.createTable(new Table({
      name: 'webhook_logs',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'endpointId', type: 'uuid', isNullable: false },
        { name: 'event', type: 'varchar', isNullable: false },
        { name: 'payload', type: 'jsonb', isNullable: false },
        { name: 'responseStatus', type: 'int', isNullable: true },
        { name: 'responseBody', type: 'text', isNullable: true },
        { name: 'success', type: 'boolean', default: false },
        { name: 'attempts', type: 'int', default: 1 },
        { name: 'error', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createIndex('webhook_logs', new TableIndex({ columnNames: ['endpointId'] }));
    await queryRunner.createForeignKey('webhook_logs', new TableForeignKey({ columnNames: ['endpointId'], referencedTableName: 'webhook_endpoints', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('webhook_logs');
    await queryRunner.dropTable('webhook_endpoints');
  }
}
