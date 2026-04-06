import { DataSource } from 'typeorm';
import * as path from 'path';
import * as dotenv from 'dotenv';

dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

async function runSeeds() {
  const dataSource = new DataSource({
    type: 'postgres',
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    username: process.env.DB_USERNAME || 'vttm',
    password: process.env.DB_PASSWORD || 'vttm_dev',
    database: process.env.DB_DATABASE || 'vttm',
    entities: [path.join(__dirname, '..', '..', '**', '*.entity{.ts,.js}')],
    synchronize: false,
  });

  await dataSource.initialize();
  console.log('Database connected for seeding.');

  const queryRunner = dataSource.createQueryRunner();
  await queryRunner.startTransaction();

  try {
    // 1. Seed organization
    console.log('Seeding organization...');
    await queryRunner.query(`
      INSERT INTO organizations (id, name, slug, settings, "isActive", "contactEmail")
      VALUES (
        'a0000000-0000-0000-0000-000000000001',
        'VTTM Logistics Demo',
        'vttm-demo',
        '{"defaultLocale":"vi","timezone":"Asia/Ho_Chi_Minh","codEnabled":true,"codFeePercent":1.5,"codMinFee":10000,"codSettlementDays":3,"maxDeliveryAttempts":3}',
        true,
        'admin@vttm.local'
      )
      ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    `);

    // 2. Seed super admin user
    console.log('Seeding admin user...');
    const bcrypt = require('bcrypt');
    const passwordHash = await bcrypt.hash('Admin@123', 12);
    await queryRunner.query(`
      INSERT INTO users (id, email, "passwordHash", "fullName", role, "organizationId", locale, "isActive")
      VALUES (
        'b0000000-0000-0000-0000-000000000001',
        'admin@vttm.local',
        $1,
        'System Admin',
        'SUPER_ADMIN',
        'a0000000-0000-0000-0000-000000000001',
        'vi',
        true
      )
      ON CONFLICT DO NOTHING
    `, [passwordHash]);

    // 3. Seed Vietnam provinces
    console.log('Seeding provinces...');
    const provincesData = require('../data/provinces.json');
    for (let i = 0; i < provincesData.length; i += 500) {
      const chunk = provincesData.slice(i, i + 500);
      for (const p of chunk) {
        await queryRunner.query(`
          INSERT INTO provinces (code, name, "nameEn", "fullName", "fullNameEn", "codeName", type)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "nameEn" = EXCLUDED."nameEn"
        `, [p.code, p.name, p.name_en || p.nameEn || p.name, p.full_name || p.fullName || p.name, p.full_name_en || p.fullNameEn || p.name, p.code_name || p.codeName || p.code, p.type || 'tinh']);
      }
    }
    console.log(`  ${provincesData.length} provinces seeded.`);

    // 4. Seed districts
    console.log('Seeding districts...');
    const districtsData = require('../data/districts.json');
    for (let i = 0; i < districtsData.length; i += 500) {
      const chunk = districtsData.slice(i, i + 500);
      for (const d of chunk) {
        await queryRunner.query(`
          INSERT INTO districts (code, name, "nameEn", "fullName", "fullNameEn", "codeName", type, "provinceCode")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "nameEn" = EXCLUDED."nameEn"
        `, [d.code, d.name, d.name_en || d.nameEn || d.name, d.full_name || d.fullName || d.name, d.full_name_en || d.fullNameEn || d.name, d.code_name || d.codeName || d.code, d.type || 'huyen', d.province_code || d.provinceCode]);
      }
    }
    console.log(`  ${districtsData.length} districts seeded.`);

    // 5. Seed wards
    console.log('Seeding wards...');
    const wardsData = require('../data/wards.json');
    for (let i = 0; i < wardsData.length; i += 500) {
      const chunk = wardsData.slice(i, i + 500);
      for (const w of chunk) {
        await queryRunner.query(`
          INSERT INTO wards (code, name, "nameEn", "fullName", "fullNameEn", "codeName", type, "districtCode")
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
          ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, "nameEn" = EXCLUDED."nameEn"
        `, [w.code, w.name, w.name_en || w.nameEn || w.name, w.full_name || w.fullName || w.name, w.full_name_en || w.fullNameEn || w.name, w.code_name || w.codeName || w.code, w.type || 'xa', w.district_code || w.districtCode]);
      }
    }
    console.log(`  ${wardsData.length} wards seeded.`);

    // 6. Seed hubs
    console.log('Seeding hubs...');
    const hubs = [
      {
        id: 'c0000000-0000-0000-0000-000000000001',
        name: 'Trung tâm phân loại HCM',
        code: 'SC-HCM',
        type: 'SORTING_CENTER',
        lng: 106.6297,
        lat: 10.8231,
        address: { provinceName: 'TP. Hồ Chí Minh', districtName: 'Quận 12', streetAddress: 'KCN Tân Thới Hiệp', country: 'VN' },
      },
      {
        id: 'c0000000-0000-0000-0000-000000000002',
        name: 'Trung tâm phân loại Hà Nội',
        code: 'SC-HN',
        type: 'SORTING_CENTER',
        lng: 105.8542,
        lat: 21.0285,
        address: { provinceName: 'Hà Nội', districtName: 'Gia Lâm', streetAddress: 'KCN Phú Thị', country: 'VN' },
      },
      {
        id: 'c0000000-0000-0000-0000-000000000003',
        name: 'Trung tâm phân loại Đà Nẵng',
        code: 'SC-DN',
        type: 'SORTING_CENTER',
        lng: 108.2022,
        lat: 16.0544,
        address: { provinceName: 'Đà Nẵng', districtName: 'Liên Chiểu', streetAddress: 'KCN Hòa Khánh', country: 'VN' },
      },
    ];

    for (const h of hubs) {
      await queryRunner.query(`
        INSERT INTO hubs (id, name, code, type, "organizationId", address, location)
        VALUES ($1, $2, $3, $4, 'a0000000-0000-0000-0000-000000000001', $5,
          ST_SetSRID(ST_MakePoint($6, $7), 4326))
        ON CONFLICT DO NOTHING
      `, [h.id, h.name, h.code, h.type, JSON.stringify(h.address), h.lng, h.lat]);
    }
    console.log('  3 sorting center hubs seeded.');

    await queryRunner.commitTransaction();
    console.log('All seeds completed successfully!');
  } catch (error) {
    await queryRunner.rollbackTransaction();
    console.error('Seed failed, rolled back:', error);
    process.exit(1);
  } finally {
    await queryRunner.release();
    await dataSource.destroy();
  }
}

runSeeds();
