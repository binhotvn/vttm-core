import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole, ROLE_HIERARCHY } from '@vttm/shared';
import { ROLES_KEY } from '../decorators/roles.decorator';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }
    const { user } = context.switchToHttp().getRequest<RequestWithUser>();
    if (!user) return false;

    const userRoleLevel = ROLE_HIERARCHY[user.role as UserRole] ?? 0;
    return requiredRoles.some((role) => userRoleLevel >= ROLE_HIERARCHY[role]);
  }
}
