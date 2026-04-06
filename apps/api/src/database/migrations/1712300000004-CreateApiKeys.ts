import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateApiKeys1712300000004 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'api_keys',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'name', type: 'varchar', isNullable: false },
          { name: 'keyPrefix', type: 'varchar', length: '12', isNullable: false },
          { name: 'keyHash', type: 'varchar', isNullable: false },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'scopes', type: 'text', default: "''" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'lastUsedAt', type: 'timestamptz', isNullable: true },
          { name: 'expiresAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('api_keys', new TableIndex({ columnNames: ['organizationId'] }));

    await queryRunner.createForeignKey(
      'api_keys',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('api_keys');
  }
}
