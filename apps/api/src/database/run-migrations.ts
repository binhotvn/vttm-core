import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as path from 'path';

// Migrations imported directly to avoid glob issues
import { InitExtensions1712300000000 } from './migrations/1712300000000-InitExtensions';
import { CreateOrganizations1712300000001 } from './migrations/1712300000001-CreateOrganizations';
import { CreateUsers1712300000002 } from './migrations/1712300000002-CreateUsers';
import { CreateRefreshTokens1712300000003 } from './migrations/1712300000003-CreateRefreshTokens';
import { CreateApiKeys1712300000004 } from './migrations/1712300000004-CreateApiKeys';
import { CreateAdministrativeDivisions1712300000005 } from './migrations/1712300000005-CreateAdministrativeDivisions';
import { CreateHubs1712300000006 } from './migrations/1712300000006-CreateHubs';
import { CreateOrders1712300000007 } from './migrations/1712300000007-CreateOrders';
import { CreateOrderItems1712300000008 } from './migrations/1712300000008-CreateOrderItems';
import { CreateShipments1712300000009 } from './migrations/1712300000009-CreateShipments';
import { CreateTrackingEvents1712300000010 } from './migrations/1712300000010-CreateTrackingEvents';
import { CreateDeliveryAttempts1712300000011 } from './migrations/1712300000011-CreateDeliveryAttempts';
import { CreateBatches1712300000012 } from './migrations/1712300000012-CreateBatches';
import { CreateDrivers1712300000013 } from './migrations/1712300000013-CreateDrivers';
import { CreatePricing1712300000014 } from './migrations/1712300000014-CreatePricing';
import { CreateRoutes1712300000015 } from './migrations/1712300000015-CreateRoutes';
import { CreatePickupRequests1712300000016 } from './migrations/1712300000016-CreatePickupRequests';
import { CreateReturnRequests1712300000017 } from './migrations/1712300000017-CreateReturnRequests';
import { CreateCodTables1712300000018 } from './migrations/1712300000018-CreateCodTables';
import { CreateWebhooks1712300000019 } from './migrations/1712300000019-CreateWebhooks';
import { CreateNotifications1712300000020 } from './migrations/1712300000020-CreateNotifications';

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '15432', 10),
    username: process.env.DB_USERNAME || 'vttm',
    password: process.env.DB_PASSWORD || 'vttm_dev',
    database: process.env.DB_DATABASE || 'vttm',
    entities: [path.join(__dirname, '..', '**', '*.entity{.ts,.js}')],
    migrations: [
      InitExtensions1712300000000,
      CreateOrganizations1712300000001,
      CreateUsers1712300000002,
      CreateRefreshTokens1712300000003,
      CreateApiKeys1712300000004,
      CreateAdministrativeDivisions1712300000005,
      CreateHubs1712300000006,
      CreateOrders1712300000007,
      CreateOrderItems1712300000008,
      CreateShipments1712300000009,
      CreateTrackingEvents1712300000010,
      CreateDeliveryAttempts1712300000011,
      CreateBatches1712300000012,
      CreateDrivers1712300000013,
      CreatePricing1712300000014,
      CreateRoutes1712300000015,
      CreatePickupRequests1712300000016,
      CreateReturnRequests1712300000017,
      CreateCodTables1712300000018,
      CreateWebhooks1712300000019,
      CreateNotifications1712300000020,
    ],
    synchronize: false,
    logging: true,
  });

  await dataSource.initialize();
  console.log('Running migrations...');
  await dataSource.runMigrations();
  console.log('Migrations completed successfully!');
  await dataSource.destroy();
}

run().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});
