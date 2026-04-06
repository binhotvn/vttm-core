import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRoutes1712300000015 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "route_status_enum" AS ENUM ('PLANNED', 'OPTIMIZED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')
    `);
    await queryRunner.query(`
      CREATE TYPE "stop_type_enum" AS ENUM ('PICKUP', 'DELIVERY', 'HUB_DROPOFF', 'HUB_PICKUP')
    `);
    await queryRunner.query(`
      CREATE TYPE "stop_status_enum" AS ENUM ('PENDING', 'ARRIVED', 'COMPLETED', 'SKIPPED', 'FAILED')
    `);

    await queryRunner.createTable(new Table({
      name: 'routes',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'routeNumber', type: 'varchar', isNullable: false, isUnique: true },
        { name: 'organizationId', type: 'uuid', isNullable: false },
        { name: 'status', type: 'route_status_enum', default: "'PLANNED'" },
        { name: 'driverId', type: 'uuid', isNullable: true },
        { name: 'startHubId', type: 'uuid', isNullable: true },
        { name: 'plannedStartTime', type: 'timestamptz', isNullable: true },
        { name: 'actualStartTime', type: 'timestamptz', isNullable: true },
        { name: 'completedAt', type: 'timestamptz', isNullable: true },
        { name: 'totalDistanceKm', type: 'decimal', precision: 8, scale: 2, isNullable: true },
        { name: 'estimatedDurationMinutes', type: 'int', isNullable: true },
        { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
      ],
    }), true);

    await queryRunner.createForeignKey('routes', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('routes', new TableForeignKey({
      columnNames: ['driverId'], referencedTableName: 'drivers', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('routes', new TableForeignKey({
      columnNames: ['startHubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));

    await queryRunner.createTable(new Table({
      name: 'route_stops',
      columns: [
        { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
        { name: 'routeId', type: 'uuid', isNullable: false },
        { name: 'sequenceNumber', type: 'int', isNullable: false },
        { name: 'type', type: 'stop_type_enum', isNullable: false },
        { name: 'shipmentId', type: 'uuid', isNullable: true },
        { name: 'address', type: 'jsonb', isNullable: false },
        { name: 'geoLocation', type: 'jsonb', isNullable: true },
        { name: 'status', type: 'stop_status_enum', default: "'PENDING'" },
        { name: 'estimatedArrival', type: 'timestamptz', isNullable: true },
        { name: 'actualArrival', type: 'timestamptz', isNullable: true },
        { name: 'completedAt', type: 'timestamptz', isNullable: true },
        { name: 'notes', type: 'text', isNullable: true },
      ],
    }), true);

    await queryRunner.createIndex('route_stops', new TableIndex({ columnNames: ['routeId', 'sequenceNumber'] }));
    await queryRunner.createForeignKey('route_stops', new TableForeignKey({
      columnNames: ['routeId'], referencedTableName: 'routes', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('route_stops', new TableForeignKey({
      columnNames: ['shipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('route_stops');
    await queryRunner.dropTable('routes');
    await queryRunner.query(`DROP TYPE IF EXISTS "stop_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "stop_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "route_status_enum"`);
  }
}
