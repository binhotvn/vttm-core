import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateDrivers1712300000013 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "driver_status_enum" AS ENUM (
        'AVAILABLE', 'ON_DUTY', 'ON_BREAK', 'OFF_DUTY', 'ON_LEAVE'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'drivers',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'userId', type: 'uuid', isNullable: false, isUnique: true },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'status', type: 'driver_status_enum', default: "'AVAILABLE'" },
          { name: 'licenseNumber', type: 'varchar', isNullable: true },
          { name: 'currentLocation', type: 'jsonb', isNullable: true },
          { name: 'homeHubId', type: 'uuid', isNullable: true },
          { name: 'capabilities', type: 'jsonb', default: "'{}'" },
          { name: 'performanceMetrics', type: 'jsonb', default: "'{}'" },
          { name: 'schedule', type: 'jsonb', isNullable: true },
          { name: 'bankAccount', type: 'jsonb', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('drivers', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createForeignKey('drivers', new TableForeignKey({
      columnNames: ['userId'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('drivers', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('drivers', new TableForeignKey({
      columnNames: ['homeHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('drivers');
    await queryRunner.query(`DROP TYPE IF EXISTS "driver_status_enum"`);
  }
}
