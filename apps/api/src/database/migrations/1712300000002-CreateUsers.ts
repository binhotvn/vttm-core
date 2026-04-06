import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateUsers1712300000002 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "user_role_enum" AS ENUM (
        'SUPER_ADMIN', 'ORG_ADMIN', 'DISPATCHER', 'WAREHOUSE', 'CASHIER', 'DRIVER', 'CUSTOMER'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'users',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'email', type: 'varchar', isNullable: false },
          { name: 'passwordHash', type: 'varchar', isNullable: false },
          { name: 'fullName', type: 'varchar', isNullable: false },
          { name: 'phone', type: 'varchar', isNullable: true },
          { name: 'role', type: 'user_role_enum', default: "'CUSTOMER'" },
          { name: 'organizationId', type: 'uuid', isNullable: true },
          { name: 'locale', type: 'varchar', length: '5', default: "'vi'" },
          { name: 'isActive', type: 'boolean', default: true },
          { name: 'lastLoginAt', type: 'timestamptz', isNullable: true },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    // Partial unique index: allow re-registration of soft-deleted emails
    await queryRunner.query(
      `CREATE UNIQUE INDEX "UQ_users_email_active" ON "users" ("email") WHERE "deletedAt" IS NULL`,
    );

    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['organizationId'] }));
    await queryRunner.createIndex('users', new TableIndex({ columnNames: ['organizationId', 'role'] }));

    await queryRunner.createForeignKey(
      'users',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('users');
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
  }
}
