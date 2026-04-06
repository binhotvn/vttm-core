import { MigrationInterface, QueryRunner, Table } from 'typeorm';

export class CreateOrganizations1712300000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'organizations',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'slug', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'settings', type: 'jsonb', default: "'{}'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'contactEmail', type: 'varchar', isNullable: true },
          { name: 'contactPhone', type: 'varchar', isNullable: true },
          { name: 'logoUrl', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('organizations');
  }
}
