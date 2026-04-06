import { MigrationInterface, QueryRunner, Table, TableForeignKey } from 'typeorm';

export class CreateOrderItems1712300000008 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'order_items',
        columns: [
          { name: 'id', type: 'uuid', isPrimary: true, default: 'uuid_generate_v4()' },
          { name: 'orderId', type: 'uuid', isNullable: false },
          { name: 'description', type: 'varchar', isNullable: false },
          { name: 'quantity', type: 'int', default: 1 },
          { name: 'weightKg', type: 'decimal', precision: 8, scale: 2, isNullable: true },
          { name: 'declaredValue', type: 'decimal', precision: 15, scale: 0, default: 0 },
          { name: 'isFragile', type: 'boolean', default: false },
          { name: 'isDangerous', type: 'boolean', default: false },
          { name: 'metadata', type: 'jsonb', default: "'{}'" },
          { name: 'createdAt', type: 'timestamptz', default: 'now()' },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'order_items',
      new TableForeignKey({
        columnNames: ['orderId'],
        referencedTableName: 'orders',
        referencedColumnNames: ['id'],
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropTable('order_items');
  }
}
