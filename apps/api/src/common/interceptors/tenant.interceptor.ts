import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { RequestWithUser } from '../interfaces/request-with-user.interface';

@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<RequestWithUser>();
    const user = request.user;

    if (user) {
      // SUPER_ADMIN can impersonate via header
      if (user.role === 'SUPER_ADMIN') {
        const headerOrgId = request.headers['x-organization-id'] as string;
        if (headerOrgId) {
          (request as any).organizationId = headerOrgId;
        }
      } else if (user.organizationId) {
        (request as any).organizationId = user.organizationId;
      }
    }

    return next.handle();
  }
}
