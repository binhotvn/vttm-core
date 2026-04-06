import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePickupRequests1712300000016 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "pickup_status_enum" AS ENUM (
        'REQUESTED', 'SCHEDULED', 'DRIVER_ASSIGNED', 'DRIVER_EN_ROUTE', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'FAILED'
      )
    `);

    await queryRunner.createTable(new Table({
      name: 'pickup_requests',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'pickupNumber', type: 'varchar', isNullable: false, isUnique: true },
        { name: 'organizationId', type: 'uuid', isNullable: false },
        { name: 'customerId', type: 'uuid', isNullable: true },
        { name: 'status', type: 'pickup_status_enum', default: "'REQUESTED'" },
        { name: 'pickupAddress', type: 'jsonb', isNullable: false },
        { name: 'contactInfo', type: 'jsonb', isNullable: false },
        { name: 'requestedDate', type: 'timestamptz', isNullable: false },
        { name: 'timeSlot', type: 'jsonb', isNullable: true },
        { name: 'assignedDriverId', type: 'uuid', isNullable: true },
        { name: 'estimatedPieceCount', type: 'int', default: 0 },
        { name: 'estimatedWeightKg', type: 'decimal', precision: 8, scale: 2, default: 0 },
        { name: 'specialInstructions', type: 'text', isNullable: true },
        { name: 'confirmation', type: 'jsonb', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createIndex('pickup_requests', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createForeignKey('pickup_requests', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('pickup_requests', new TableForeignKey({
      columnNames: ['customerId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('pickup_requests', new TableForeignKey({
      columnNames: ['assignedDriverId'], referencedTableName: 'drivers', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pickup_requests');
    await queryRunner.query(`DROP TYPE IF EXISTS "pickup_status_enum"`);
  }
}
