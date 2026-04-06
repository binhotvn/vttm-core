# VTTM Demo Accounts & Services

## Application URLs

| Service        | URL                              |
| -------------- | -------------------------------- |
| API            | http://localhost:3000/api/v1     |
| API Docs       | http://localhost:3000/api/docs   |
| Admin          | http://localhost:3001            |
| User Portal    | http://localhost:3002            |
| Keycloak       | http://localhost:8080            |
| MinIO Console  | http://localhost:9001            |

## Demo User Accounts

### Super Admin

| Field    | Value              |
| -------- | ------------------ |
| Email    | admin@vttm.local   |
| Password | Admin@123          |
| Role     | SUPER_ADMIN        |
| Name     | System Admin       |
| Locale   | vi                 |

### Customer

| Field    | Value              |
| -------- | ------------------ |
| Email    | customer@vttm.local|
| Password | Customer@123       |
| Role     | CUSTOMER           |
| Name     | Demo Customer      |
| Locale   | vi                 |

## Available Roles

| Role         | Description             |
| ------------ | ----------------------- |
| SUPER_ADMIN  | Super administrator     |
| ORG_ADMIN    | Organization admin      |
| DISPATCHER   | Dispatcher              |
| WAREHOUSE    | Warehouse staff         |
| CASHIER      | Cashier                 |
| DRIVER       | Delivery driver         |
| CUSTOMER     | Customer / Shipper      |

## Organization

| Field         | Value                          |
| ------------- | ------------------------------ |
| Name          | VTTM Logistics Demo            |
| Slug          | vttm-demo                      |
| Contact Email | admin@vttm.local               |
| Locale        | vi                             |
| Timezone      | Asia/Ho_Chi_Minh               |

## Infrastructure Credentials

### PostgreSQL

| Field    | Value     |
| -------- | --------- |
| Host     | localhost |
| Port     | 15432     |
| Username | vttm      |
| Password | vttm_dev  |
| Database | vttm      |

### Redis

| Field | Value     |
| ----- | --------- |
| Host  | localhost |
| Port  | 16379     |

### MinIO (S3)

| Field      | Value                  |
| ---------- | ---------------------- |
| Endpoint   | http://localhost:9000  |
| Access Key | minioadmin             |
| Secret Key | minioadmin             |
| Bucket     | vttm                   |

### Keycloak Admin

| Field    | Value |
| -------- | ----- |
| Username | admin |
| Password | admin |
| Realm    | vttm  |

## Seed Data - Sorting Hubs

| Code   | Name                           | Location       |
| ------ | ------------------------------ | -------------- |
| SC-HCM | Trung tam phan loai HCM        | Ho Chi Minh    |
| SC-HN  | Trung tam phan loai Ha Noi     | Hanoi          |
| SC-DN  | Trung tam phan loai Da Nang    | Da Nang        |
