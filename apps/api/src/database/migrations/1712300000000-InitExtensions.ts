import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitExtensions1712300000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "postgis"`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "unaccent"`);

    await queryRunner.query(`
      CREATE OR REPLACE FUNCTION f_unaccent(text)
      RETURNS text AS $$
        SELECT public.unaccent('public.unaccent', $1);
      $$ LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT;
    `);

    // Create TypeORM metadata table for generated columns tracking
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "typeorm_metadata" (
        "type" varchar NOT NULL,
        "database" varchar,
        "schema" varchar,
        "table" varchar,
        "name" varchar,
        "value" text
      )
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS f_unaccent(text)`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "unaccent"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "postgis"`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS "uuid-ossp"`);
  }
}
