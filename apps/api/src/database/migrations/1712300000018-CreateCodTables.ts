import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateCodTables1712300000018 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE TYPE "cod_status_enum" AS ENUM ('COLLECTED', 'VERIFIED', 'DISCREPANCY', 'TRANSFERRED', 'DISPUTED')`);
    await queryRunner.query(`CREATE TYPE "cod_transfer_status_enum" AS ENUM ('PENDING', 'PROCESSING', 'TRANSFERRED', 'FAILED')`);

    await queryRunner.createTable(new Table({
      name: 'cod_collections',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'organizationId', type: 'uuid', isNullable: false },
        { name: 'shipmentId', type: 'uuid', isNullable: false },
        { name: 'driverId', type: 'uuid', isNullable: false },
        { name: 'senderId', type: 'uuid', isNullable: true },
        { name: 'expectedAmount', type: 'decimal', precision: 15, scale: 0, isNullable: false },
        { name: 'collectedAmount', type: 'decimal', precision: 15, scale: 0, isNullable: false },
        { name: 'codFee', type: 'decimal', precision: 15, scale: 0, default: 0 },
        { name: 'shippingFee', type: 'decimal', precision: 15, scale: 0, default: 0 },
        { name: 'netTransferAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
        { name: 'collectedDate', type: 'date', isNullable: false },
        { name: 'status', type: 'cod_status_enum', default: "'COLLECTED'" },
        { name: 'transferStatus', type: 'cod_transfer_status_enum', default: "'PENDING'" },
        { name: 'bankTransferRef', type: 'varchar', isNullable: true },
        { name: 'transferredAt', type: 'timestamptz', isNullable: true },
        { name: 'discrepancyNote', type: 'text', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createIndex('cod_collections', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createIndex('cod_collections', new TableIndex({ columnNames: ['driverId', 'collectedDate'] }));
    await queryRunner.createIndex('cod_collections', new TableIndex({ columnNames: ['senderId', 'transferStatus'] }));
    await queryRunner.createForeignKey('cod_collections', new TableForeignKey({ columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
    await queryRunner.createForeignKey('cod_collections', new TableForeignKey({ columnNames: ['shipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE' }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('cod_collections');
    await queryRunner.query(`DROP TYPE IF EXISTS "cod_transfer_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "cod_status_enum"`);
  }
}
