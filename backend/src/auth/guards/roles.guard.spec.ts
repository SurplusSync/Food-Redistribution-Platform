import { RolesGuard } from './roles.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { UserRole } from '../entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(() => {
    guard = new RolesGuard();
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should allow access for ADMIN role', () => {
    const mockContext = createMockExecutionContext({
      userId: 'admin-123',
      email: 'admin@surplussync.com',
      role: UserRole.ADMIN,
    });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('should deny access for DONOR role', () => {
    const mockContext = createMockExecutionContext({
      userId: 'donor-123',
      email: 'donor@example.com',
      role: UserRole.DONOR,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(mockContext)).toThrow(
      'Access Denied: Only Administrators can perform this action.',
    );
  });

  it('should deny access for NGO role', () => {
    const mockContext = createMockExecutionContext({
      userId: 'ngo-123',
      email: 'ngo@example.com',
      role: UserRole.NGO,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should deny access for VOLUNTEER role', () => {
    const mockContext = createMockExecutionContext({
      userId: 'volunteer-123',
      email: 'volunteer@example.com',
      role: UserRole.VOLUNTEER,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should deny access if no user is attached to request', () => {
    const mockContext = createMockExecutionContext(null);

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should deny access if user object exists but has no role', () => {
    const mockContext = createMockExecutionContext({
      userId: 'user-123',
      email: 'user@example.com',
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});

// Helper function to create mock ExecutionContext
function createMockExecutionContext(user: any): ExecutionContext {
  return {
    switchToHttp: () => ({
      getRequest: () => ({
        user,
      }),
    }),
  } as ExecutionContext;
}
