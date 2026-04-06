import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDeliveryAttempts1712300000011 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "delivery_attempt_result_enum" AS ENUM ('SUCCESS', 'FAILED', 'PARTIAL')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'delivery_attempts',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'shipmentId', type: 'uuid', isNullable: false },
          { name: 'attemptNumber', type: 'int', isNullable: false },
          { name: 'driverId', type: 'uuid', isNullable: true },
          { name: 'result', type: 'delivery_attempt_result_enum', isNullable: false },
          { name: 'failureReasonCode', type: 'varchar', isNullable: true },
          { name: 'failureNotes', type: 'text', isNullable: true },
          { name: 'photoUrls', type: 'jsonb', isNullable: true },
          { name: 'geoLocation', type: 'jsonb', isNullable: true },
          { name: 'attemptedAt', type: 'timestamptz', isNullable: false },
          { name: 'rescheduledTo', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('delivery_attempts', new TableIndex({ columnNames: ['shipmentId', 'attemptNumber'] }));

    await queryRunner.createForeignKey('delivery_attempts', new TableForeignKey({
      columnNames: ['shipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('delivery_attempts');
    await queryRunner.query(`DROP TYPE IF EXISTS "delivery_attempt_result_enum"`);
  }
}
