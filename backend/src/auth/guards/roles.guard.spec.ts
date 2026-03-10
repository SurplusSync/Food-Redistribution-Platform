import { Test, TestingModule } from '@nestjs/testing';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../entities/user.entity';

describe('RolesGuard', () => {
  let guard: RolesGuard;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [RolesGuard],
    }).compile();

    guard = module.get<RolesGuard>(RolesGuard);
  });

  // Helper factory for mocking ExecutionContext
  const mockExecutionContext = (userPayload: any): ExecutionContext => {
    return {
      switchToHttp: jest.fn().mockReturnValue({
        getRequest: jest.fn().mockReturnValue({
          user: userPayload,
        }),
      }),
    } as unknown as ExecutionContext;
  };

  describe('1. Role Authorization', () => {
    it('User with correct role should access endpoint', () => {
      const context = mockExecutionContext({
        userId: 'admin-123',
        email: 'admin@surplussync.com',
        role: UserRole.ADMIN,
      });

      const result = guard.canActivate(context);

      // Expected to allow access for the ADMIN role by returning true
      expect(result).toBe(true);
    });
  });

  describe('2. Role Spoofing Prevention', () => {
    it('If a user attempts to modify role in request payload, access should be denied', () => {
      // Simulate an attacker injecting a spoofed struct into the JWT
      // While JWTs are structurally tamper-proof when signature-verified, testing guards 
      // ensuring that they strongly evaluate the exact enum type prevents logical routing errors.
      const context = mockExecutionContext({
        userId: 'attacker-123',
        role: 'ADMIN_SPOOF', // Not the actual enum value UserRole.ADMIN
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('If a payload provides array of roles where one is admin, it should be strictly denied', () => {
      // Ensures strict equality to the enum is used rather than loose inclusion checks
      const context = mockExecutionContext({
        userId: 'attacker-123',
        role: [UserRole.ADMIN, UserRole.DONOR],
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('3. Unauthorized Access', () => {
    it('User without required role (DONOR) should receive ForbiddenException', () => {
      const context = mockExecutionContext({
        userId: 'donor-123',
        role: UserRole.DONOR,
      });

      // Validates that it throws the standard NestJS exception
      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);

      // Validates the specific error message
      expect(() => guard.canActivate(context)).toThrow(
        'Access Denied: Only Administrators can perform this action.'
      );
    });

    it('User without required role (NGO) should receive ForbiddenException', () => {
      const context = mockExecutionContext({
        userId: 'ngo-123',
        role: UserRole.NGO,
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('User without required role (VOLUNTEER) should receive ForbiddenException', () => {
      const context = mockExecutionContext({
        userId: 'volunteer-123',
        role: UserRole.VOLUNTEER,
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

  describe('4. Missing JWT Payload', () => {
    it('Guard should reject request if user object is completely missing', () => {
      const context = mockExecutionContext(undefined);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('Guard should reject request if user object exists but role is missing', () => {
      const context = mockExecutionContext({
        userId: 'user-123',
        // role is intentionally omitted
      });

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });

    it('Guard should reject request if user object is null', () => {
      const context = mockExecutionContext(null);

      expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
    });
  });

});
