import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreatePricing1712300000014 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "pricing_method_enum" AS ENUM ('FLAT_RATE', 'PER_KG', 'TIERED', 'ZONE_MATRIX')
    `);

    await queryRunner.createTable(
      new Table({
        name: 'pricing_zones',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'nameEn', type: 'varchar', isNullable: false },
          { name: 'code', type: 'varchar', isNullable: false },
          { name: 'provinceCodes', type: 'varchar[]', default: "'{}'" },
          { name: 'districtCodes', type: 'varchar[]', isNullable: true },
          { name: 'isRemote', type: 'boolean', default: false },
          { name: 'slaHours', type: 'int', default: 72 },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_pricing_zone_org_code" ON "pricing_zones" ("organizationId", "code")`,
    );
    await queryRunner.createForeignKey('pricing_zones', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));

    await queryRunner.createTable(
      new Table({
        name: 'pricing_rules',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'serviceType', type: 'service_type_enum', isNullable: false },
          { name: 'conditions', type: 'jsonb', default: "'{}'" },
          { name: 'method', type: 'pricing_method_enum', isNullable: false },
          { name: 'rates', type: 'jsonb', isNullable: false },
          { name: 'priority', type: 'int', default: 0 },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey('pricing_rules', new TableForeignKey({
      columnNames: ['organizationId'], referencedTableName: 'organizations', referencedColumnNames: ['id'], onDelete: 'CASCADE',
    }));
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('pricing_rules');
    await queryRunner.dropTable('pricing_zones');
    await queryRunner.query(`DROP TYPE IF EXISTS "pricing_method_enum"`);
  }
}
