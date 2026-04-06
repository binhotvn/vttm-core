import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateAdministrativeDivisions1712300000005 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    // Provinces
    await queryRunner.createTable(
      new Table({
        name: 'provinces',
        columns: [
          { name: 'code', type: 'varchar', length: '5', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'nameEn', type: 'varchar', isNullable: false },
          { name: 'fullName', type: 'varchar', isNullable: false },
          { name: 'fullNameEn', type: 'varchar', isNullable: false },
          { name: 'codeName', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', length: '30', isNullable: false },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    // Add generated column for diacritics-free search
    await queryRunner.query(
      `ALTER TABLE "provinces" ADD COLUMN "nameSearch" varchar GENERATED ALWAYS AS (f_unaccent(lower(name))) STORED`,
    );

    // Districts
    await queryRunner.createTable(
      new Table({
        name: 'districts',
        columns: [
          { name: 'code', type: 'varchar', length: '5', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'nameEn', type: 'varchar', isNullable: false },
          { name: 'fullName', type: 'varchar', isNullable: false },
          { name: 'fullNameEn', type: 'varchar', isNullable: false },
          { name: 'codeName', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', length: '30', isNullable: false },
          { name: 'provinceCode', type: 'varchar', length: '5', isNullable: false },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `ALTER TABLE "districts" ADD COLUMN "nameSearch" varchar GENERATED ALWAYS AS (f_unaccent(lower(name))) STORED`,
    );

    await queryRunner.createIndex('districts', new TableIndex({ columnNames: ['provinceCode'] }));
    await queryRunner.createForeignKey(
      'districts',
      new TableForeignKey({
        columnNames: ['provinceCode'],
        referencedTableName: 'provinces',
        referencedColumnNames: ['code'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );

    // Wards
    await queryRunner.createTable(
      new Table({
        name: 'wards',
        columns: [
          { name: 'code', type: 'varchar', length: '10', isPrimary: true },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'nameEn', type: 'varchar', isNullable: false },
          { name: 'fullName', type: 'varchar', isNullable: false },
          { name: 'fullNameEn', type: 'varchar', isNullable: false },
          { name: 'codeName', type: 'varchar', isNullable: false },
          { name: 'type', type: 'varchar', length: '30', isNullable: false },
          { name: 'districtCode', type: 'varchar', length: '5', isNullable: false },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.query(
      `ALTER TABLE "wards" ADD COLUMN "nameSearch" varchar GENERATED ALWAYS AS (f_unaccent(lower(name))) STORED`,
    );

    await queryRunner.createIndex('wards', new TableIndex({ columnNames: ['districtCode'] }));
    await queryRunner.createForeignKey(
      'wards',
      new TableForeignKey({
        columnNames: ['districtCode'],
        referencedTableName: 'districts',
        referencedColumnNames: ['code'],
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('wards');
    await queryRunner.dropTable('districts');
    await queryRunner.dropTable('provinces');
  }
}
