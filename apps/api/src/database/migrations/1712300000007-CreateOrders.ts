import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class CreateOrders1712300000007 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TYPE "order_status_enum" AS ENUM (
        'DRAFT', 'CONFIRMED', 'PROCESSING', 'PARTIALLY_SHIPPED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'RETURNED'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "service_type_enum" AS ENUM (
        'STANDARD', 'EXPRESS', 'SAME_DAY', 'ECONOMY', 'OVERNIGHT', 'FREIGHT'
      )
    `);
    await queryRunner.query(`
      CREATE TYPE "payment_method_enum" AS ENUM (
        'PREPAID', 'COD', 'BILLED'
      )
    `);

    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'orderNumber', type: 'varchar', isNullable: false, isUnique: true },
          { name: 'organizationId', type: 'uuid', isNullable: false },
          { name: 'customerId', type: 'uuid', isNullable: true },
          { name: 'senderAddress', type: 'jsonb', isNullable: false },
          { name: 'recipientAddress', type: 'jsonb', isNullable: false },
          { name: 'customerPhone', type: 'varchar', isNullable: true },
          { name: 'customerEmail', type: 'varchar', isNullable: true },
          { name: 'status', type: 'order_status_enum', default: "'DRAFT'" },
          { name: 'serviceType', type: 'service_type_enum', default: "'STANDARD'" },
          { name: 'paymentMethod', type: 'payment_method_enum', default: "'PREPAID'" },
          { name: 'totalAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'codAmount', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'specialInstructions', type: 'text', isNullable: true },
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
          { name: 'updatedAt', type: 'timestamptz', default: 'now()' },
          { name: 'deletedAt', type: 'timestamptz', isNullable: true },
        ],
      }),
      true,
    );

    await queryRunner.createIndex('orders', new TableIndex({ columnNames: ['organizationId', 'status'] }));
    await queryRunner.createIndex('orders', new TableIndex({ columnNames: ['organizationId', 'createdAt'] }));
    await queryRunner.createIndex('orders', new TableIndex({ columnNames: ['customerPhone'] }));

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['organizationId'],
        referencedTableName: 'organizations',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['customerId'],
        referencedTableName: 'users',
        referencedColumnNames: ['id'],
        onDelete: 'SET NULL',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('orders');
    await queryRunner.query(`DROP TYPE IF EXISTS "payment_method_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "service_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "order_status_enum"`);
  }
}
