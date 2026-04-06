import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateReturnRequests1712300000017 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "return_status_enum" AS ENUM (
        'REQUESTED', 'APPROVED', 'LABEL_CREATED', 'IN_TRANSIT', 'DELIVERED_TO_SENDER', 'COMPLETED', 'REJECTED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "return_reason_enum" AS ENUM (
        'MAX_ATTEMPTS_REACHED', 'RECIPIENT_REFUSED', 'SENDER_REQUESTED', 'DAMAGED', 'WRONG_ITEM'
      )
    `);

    await queryRunner.createTable(new Table({
      name: 'return_requests',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'returnNumber', type: 'varchar', isNullable: false, isUnique: true },
        { name: 'organizationId', type: 'uuid', isNullable: false },
        { name: 'originalShipmentId', type: 'uuid', isNullable: false },
        { name: 'returnShipmentId', type: 'uuid', isNullable: true },
        { name: 'status', type: 'return_status_enum', default: "'REQUESTED'" },
        { name: 'reason', type: 'return_reason_enum', isNullable: false },
        { name: 'returnFee', type: 'decimal', precision: 15, scale: 0, default: 0 },
        { name: 'notes', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createForeignKey('return_requests', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('return_requests', new TableForeignKey({
      columnNames: ['originalShipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('return_requests', new TableForeignKey({
      columnNames: ['returnShipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('return_requests');
    await queryRunner.query(`DROP TYPE IF EXISTS "return_reason_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "return_status_enum"`);
  }
}
