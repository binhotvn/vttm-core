import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from '../guards/roles.guard';
import { UserRole } from '@vttm/shared';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new RolesGuard(reflector);
  });

  const mockContext = (role: string, requiredRoles?: UserRole[]) => {
    const ctx = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({ user: { sub: '1', role, organizationId: 'org-1', email: 'test@test.com' } }),
      }),
    } as unknown as ExecutionContext;

    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(requiredRoles ?? null);
    return ctx;
  };

  it('should allow when no roles required', () => {
    expect(guard.canActivate(mockContext('CUSTOMER'))).toBe(true);
  });

  it('should allow SUPER_ADMIN to access ORG_ADMIN routes', () => {
    expect(guard.canActivate(mockContext('SUPER_ADMIN', [UserRole.ORG_ADMIN]))).toBe(true);
  });

  it('should allow exact role match', () => {
    expect(guard.canActivate(mockContext('DISPATCHER', [UserRole.DISPATCHER]))).toBe(true);
  });

  it('should reject lower role', () => {
    expect(guard.canActivate(mockContext('CUSTOMER', [UserRole.ORG_ADMIN]))).toBe(false);
  });

  it('should reject DRIVER accessing DISPATCHER routes', () => {
    expect(guard.canActivate(mockContext('DRIVER', [UserRole.DISPATCHER]))).toBe(false);
  });

  it('should allow higher role to access lower role routes', () => {
    expect(guard.canActivate(mockContext('ORG_ADMIN', [UserRole.WAREHOUSE]))).toBe(true);
    expect(guard.canActivate(mockContext('ORG_ADMIN', [UserRole.CASHIER]))).toBe(true);
    expect(guard.canActivate(mockContext('ORG_ADMIN', [UserRole.DRIVER]))).toBe(true);
  });
});
