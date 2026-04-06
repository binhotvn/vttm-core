import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import * as path from 'path';
import { I18nModule, HeaderResolver, AcceptLanguageResolver, QueryResolver } from 'nestjs-i18n';
import { databaseConfig, jwtConfig, appConfig } from './config';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { TenantInterceptor } from './common/interceptors/tenant.interceptor';
import { HealthModule } from './health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { GeoModule } from './modules/geo/geo.module';
import { HubsModule } from './modules/hubs/hubs.module';
import { OrdersModule } from './modules/orders/orders.module';
import { ShipmentsModule } from './modules/shipments/shipments.module';
import { TrackingModule } from './modules/tracking/tracking.module';
import { DeliveryModule } from './modules/delivery/delivery.module';
import { BatchesModule } from './modules/batches/batches.module';
import { DriversModule } from './modules/drivers/drivers.module';
import { PricingModule } from './modules/pricing/pricing.module';
import { RoutesModule } from './modules/routes/routes.module';
import { PickupModule } from './modules/pickup/pickup.module';
import { ReturnsModule } from './modules/returns/returns.module';
import { CodModule } from './modules/cod/cod.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { ReportsModule } from './modules/reports/reports.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, jwtConfig, appConfig],
      envFilePath: ['.env', '../../.env'],
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres' as const,
        host: config.get<string>('database.host'),
        port: config.get<number>('database.port'),
        username: config.get<string>('database.username'),
        password: config.get<string>('database.password'),
        database: config.get<string>('database.database'),
        entities: [path.join(__dirname, '**', '*.entity{.ts,.js}')],
        migrations: [path.join(__dirname, 'database', 'migrations', '*{.ts,.js}')],
        synchronize: false,
        logging: config.get<string>('app.env') === 'development',
      }),
    }),
    I18nModule.forRoot({
      fallbackLanguage: 'vi',
      loaderOptions: {
        path: path.join(__dirname, '/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: HeaderResolver, options: ['x-lang', 'accept-language'] },
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
    }),
    HealthModule,
    AuthModule,
    UsersModule,
    OrganizationsModule,
    GeoModule,
    HubsModule,
    OrdersModule,
    ShipmentsModule,
    TrackingModule,
    DeliveryModule,
    BatchesModule,
    DriversModule,
    PricingModule,
    RoutesModule,
    PickupModule,
    ReturnsModule,
    CodModule,
    WebhooksModule,
    NotificationsModule,
    ReportsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
    { provide: 'APP_INTERCEPTOR', useClass: TenantInterceptor },
  ],
})
export class AppModule {}
