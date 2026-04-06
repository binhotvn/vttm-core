import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateTrackingEvents1712300000010 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'tracking_events',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'shipmentId', type: 'uuid', isNullable: false },
          { name: 'status', type: 'shipment_status_enum', isNullable: false },
          { name: 'titleVi', type: 'varchar', isNullable: false },
          { name: 'titleEn', type: 'varchar', isNullable: false },
          { name: 'descriptionVi', type: 'text', isNullable: true },
          { name: 'descriptionEn', type: 'text', isNullable: true },
          { name: 'location', type: 'varchar', isNullable: true },
          { name: 'geoLocation', type: 'jsonb', isNullable: true },
          { name: 'hubId', type: 'uuid', isNullable: true },
          { name: 'performedById', type: 'uuid', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          { name: 'timestamp', type: 'timestamptz', isNullable: false },
          { name: 'isPublic', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('tracking_events', new TableIndex({ columnNames: ['shipmentId', 'timestamp'] }));

    await queryRunner.createForeignKey('tracking_events', new TableForeignKey({
      columnNames: ['shipmentId'], referencedTableName: 'shipments', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
    await queryRunner.createForeignKey('tracking_events', new TableForeignKey({
      columnNames: ['hubId'], referencedTableName: 'hubs', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
    await queryRunner.createForeignKey('tracking_events', new TableForeignKey({
      columnNames: ['performedById'], referencedTableName: 'users', referencedColumnNames: ['id'], onDelete: 'SET NULL',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('tracking_events');
  }
}
