import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateRefreshTokens1712300000003 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'refresh_tokens',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'tokenHash', type: 'varchar', isNullable: false },
          { name: 'userId', type: 'uuid', isNullable: false },
          { name: 'expiresAt', type: 'timestamptz', isNullable: false },
          { name: 'isRevoked', type: 'boolean', default: false },
          { name: 'userAgent', type: 'varchar', isNullable: true },
          { name: 'ipAddress', type: 'varchar', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('refresh_tokens', new TableIndex({ columnNames: ['userId'] }));

    await queryRunner.createForeignKey(
      'refresh_tokens',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('refresh_tokens');
  }
}
