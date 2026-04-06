export enum UserRole {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ORG_ADMIN = 'ORG_ADMIN',
  DISPATCHER = 'DISPATCHER',
  WAREHOUSE = 'WAREHOUSE',
  CASHIER = 'CASHIER',
  DRIVER = 'DRIVER',
  CUSTOMER = 'CUSTOMER',
}

export const ROLE_HIERARCHY: Record<UserRole, number> = {
  [UserRole.SUPER_ADMIN]: 100,
  [UserRole.ORG_ADMIN]: 90,
  [UserRole.DISPATCHER]: 70,
  [UserRole.WAREHOUSE]: 60,
  [UserRole.CASHIER]: 50,
  [UserRole.DRIVER]: 30,
  [UserRole.CUSTOMER]: 10,
};
