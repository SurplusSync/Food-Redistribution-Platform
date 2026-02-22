import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

@Injectable()
export class RolesGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user; // Injected by JwtAuthGuard

    if (!user || user.role !== UserRole.ADMIN) {
      throw new ForbiddenException('Access Denied: Only Administrators can perform this action.');
    }
    return true;
  }
}
