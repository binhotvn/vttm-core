import 'dotenv/config';
import { DataSource } from 'typeorm';
import { join } from 'path';

export default new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'vttm',
  password: process.env.DB_PASSWORD || 'vttm_dev',
  database: process.env.DB_DATABASE || 'vttm',
  entities: [join(__dirname, '..', '**', '*.entity{.ts,.js}')],
  migrations: [join(__dirname, '..', 'database', 'migrations', '*{.ts,.js}')],
  synchronize: false,
  logging: true,
});
