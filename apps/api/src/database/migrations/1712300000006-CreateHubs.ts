import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateHubs1712300000006 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'hubs',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'code', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', length: '30', isNullable: false },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'address', type: 'jsonb', isNullable: false },
          { name: 'serviceDistrictCodes', type: 'varchar[]', default: "'{}'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'contactPhone', type: 'varchar', isNullable: true },
          { name: 'contactName', type: 'varchar', isNullable: true },
          { name: 'capacity', type: 'int', isNullable: true },
          { name: 'parentHubId', type: 'uuid', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    // Add PostGIS geometry column
    await queryRunner.query(
      `SELECT AddGeometryColumn('hubs', 'location', 4326, 'POINT', 2)`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_hubs_location" ON "hubs" USING GIST ("location")`);

    await queryRunner.createIndex('hubs', new TableIndex({ columnNames: ['organizationId'] }));
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_hubs_org_code" ON "hubs" ("organizationId", "code") WHERE "deletedAt" IS NULL`,
    );

    await queryRunner.createForeignKey(
      'hubs',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );

    await queryRunner.createForeignKey(
      'hubs',
      new TableForeignKey({
        columnNames: ['parentHubId'],
        referencedTableName: 'hubs',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('hubs');
  }
}
