import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { TENANT_REQUIRED_KEY } from '../decorators/tenant-required.decorator';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isTenantRequired = this.reflector.getAllAndOverride<boolean>(
      TENANT_REQUIRED_KEY,
      [context.getHandler(), context.getClass()],
    );

    // If tenant is not required for this route, allow access
    if (!isTenantRequired) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('User not authenticated');
    }

    // Check if user has an academy (tenant)
    if (!user.academyId) {
      throw new ForbiddenException(
        'This resource requires you to be associated with an academy. Please create or join an academy first.',
      );
    }

    // Attach tenantId to request for easy access in controllers
    request.tenantId = user.academyId;

    return true;
  }
}
