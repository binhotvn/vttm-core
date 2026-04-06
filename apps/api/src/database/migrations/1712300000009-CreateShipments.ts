import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateShipments1712300000009 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "shipment_status_enum" AS ENUM (
        'LABEL_CREATED', 'PICKUP_SCHEDULED', 'PICKUP_IN_PROGRESS', 'PICKED_UP',
        'IN_TRANSIT_TO_ORIGIN_HUB', 'AT_ORIGIN_HUB', 'SORTING', 'IN_TRANSIT',
        'AT_DESTINATION_HUB', 'OUT_FOR_DELIVERY', 'DELIVERY_ATTEMPTED',
        'DELIVERED', 'RETURNED_TO_SENDER', 'EXCEPTION', 'ON_HOLD', 'CANCELLED', 'LOST'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "shipment_priority_enum" AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'shipments',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'trackingNumber', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'barcode', type: 'varchar', isNullable: true },
          { name: 'orderId', type: 'uuid', isNullable: false },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'status', type: 'shipment_status_enum', default: "'LABEL_CREATED'" },
          { name: 'previousStatus', type: 'shipment_status_enum', isNullable: true },
          { name: 'priority', type: 'shipment_priority_enum', default: "'NORMAL'" },
          // Physical
          { name: 'weightKg', type: 'decimal', precision: 8, scale: 2, default: 0 },
          { name: 'volumetricWeightKg', type: 'decimal', precision: 8, scale: 2, isNullable: true },
          { name: 'dimensions', type: 'jsonb', isNullable: true },
          { name: 'pieceCount', type: 'int', default: 1 },
          // Addresses
          { name: 'senderAddress', type: 'jsonb', isNullable: false },
          { name: 'recipientAddress', type: 'jsonb', isNullable: false },
          // Service
          { name: 'serviceType', type: 'service_type_enum', default: "'STANDARD'" },
          // Locations
          { name: 'currentHubId', type: 'uuid', isNullable: true },
          { name: 'originHubId', type: 'uuid', isNullable: true },
          { name: 'destinationHubId', type: 'uuid', isNullable: true },
          // Assignment
          { name: 'assignedDriverId', type: 'uuid', isNullable: true },
          { name: 'batchId', type: 'uuid', isNullable: true },
          { name: 'routeId', type: 'uuid', isNullable: true },
          // Pricing (VND, no decimals)
          { name: 'shippingCost', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'codAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'codFee', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'insuranceAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'surcharges', type: 'jsonb', default: "'[]'" },
          // Dates
          { name: 'estimatedDeliveryDate', type: 'timestamptz', isNullable: true },
          { name: 'actualDeliveryDate', type: 'timestamptz', isNullable: true },
          { name: 'pickedUpAt', type: 'timestamptz', isNullable: true },
          // POD
          { name: 'proofOfDelivery', type: 'jsonb', isNullable: true },
          // Delivery
          { name: 'deliveryAttempts', type: 'int', default: 0 },
          { name: 'maxDeliveryAttempts', type: 'int', default: 3 },
          { name: 'exceptionReason', type: 'text', isNullable: true },
          // Meta
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('shipments', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createIndex('shipments', new TableIndex({ columnNames: ['organizationId', 'createdAt'] }));
    await queryRunner.createIndex('shipments', new TableIndex({ columnNames: ['currentHubId'] }));
    await queryRunner.createIndex('shipments', new TableIndex({ columnNames: ['assignedDriverId'] }));
    await queryRunner.createIndex('shipments', new TableIndex({ columnNames: ['batchId'] }));

    await queryRunner.createForeignKey('shipments', new TableForeignKey({
      columnNames: ['orderId'], referencedTableName: 'orders', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('shipments', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('shipments', new TableForeignKey({
      columnNames: ['currentHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('shipments', new TableForeignKey({
      columnNames: ['originHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('shipments', new TableForeignKey({
      columnNames: ['destinationHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('shipments');
    await queryRunner.query(`DROP TYPE IF EXISTS "shipment_priority_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "shipment_status_enum"`);
  }
}
