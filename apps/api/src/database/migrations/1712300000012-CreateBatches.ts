import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateBatches1712300000012 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "batch_status_enum" AS ENUM (
        'OPEN', 'LOCKED', 'SEALED', 'IN_TRANSIT', 'AT_HUB', 'PROCESSING', 'COMPLETED', 'CANCELLED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "batch_type_enum" AS ENUM ('PICKUP', 'TRANSFER', 'DELIVERY', 'SORT', 'RETURN')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'batches',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'batchNumber', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'status', type: 'batch_status_enum', default: "'OPEN'" },
          { name: 'type', type: 'batch_type_enum', isNullable: false },
          { name: 'originHubId', type: 'uuid', isNullable: true },
          { name: 'destinationHubId', type: 'uuid', isNullable: true },
          { name: 'assignedDriverId', type: 'uuid', isNullable: true },
          { name: 'parentBatchId', type: 'uuid', isNullable: true },
          { name: 'shipmentCount', type: 'int', default: 0 },
          { name: 'totalWeightKg', type: 'decimal', precision: 10, scale: 2, default: 0 },
          { name: 'totalCodAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'sealNumber', type: 'varchar', isNullable: true },
          { name: 'sealedAt', type: 'timestamptz', isNullable: true },
          { name: 'notes', type: 'text', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('batches', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createForeignKey('batches', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('batches', new TableForeignKey({
      columnNames: ['originHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('batches', new TableForeignKey({
      columnNames: ['destinationHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('batches', new TableForeignKey({
      columnNames: ['parentBatchId'], referencedTableName: 'batches', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));

    // BatchShipments junction table
    await queryRunner.createTable(
      new Table({
        name: 'batch_shipments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'batchId', type: 'uuid', isNullable: false },
          { name: 'shipmentId', type: 'uuid', isNullable: false },
          { name: 'sortOrder', type: 'int', isNullable: true },
          { name: 'scannedInAt', type: 'timestamptz', isNullable: true },
          { name: 'scannedOutAt', type: 'timestamptz', isNullable: true },
          { name: 'scannedById', type: 'uuid', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_batch_shipment" ON "batch_shipments" ("batchId", "shipmentId")`,
    );
    await queryRunner.createForeignKey('batch_shipments', new TableForeignKey({
      columnNames: ['batchId'], referencedTableName: 'batches', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('batch_shipments', new TableForeignKey({
      columnNames: ['shipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('batch_shipments', new TableForeignKey({
      columnNames: ['scannedById'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('batch_shipments');
    await queryRunner.dropTable('batches');
    await queryRunner.query(`DROP TYPE IF EXISTS "batch_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "batch_status_enum"`);
  }
}
