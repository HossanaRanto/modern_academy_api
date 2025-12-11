import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor to inject tenant context into the request
 * This makes the tenantId available throughout the request lifecycle
 */
@Injectable()
export class TenantInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Inject tenantId from authenticated user if available
    if (user?.academyId) {
      request.tenantId = user.academyId;
    }

    return next.handle();
  }
}
