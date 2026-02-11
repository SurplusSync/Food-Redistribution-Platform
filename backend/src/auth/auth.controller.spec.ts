import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto } from './dto/auth.dto';

// Define locally to avoid import issues from outside src
enum UserRole {
    DONOR = 'DONOR',
    NGO = 'NGO',
    VOLUNTEER = 'VOLUNTEER',
    ADMIN = 'ADMIN'
}

describe('AuthController', () => {
    let controller: AuthController;
    let authService: AuthService;

    const mockAuthService = {
        login: jest.fn(),
        register: jest.fn(),
        getProfile: jest.fn(),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            controllers: [AuthController],
            providers: [
                {
                    provide: AuthService,
                    useValue: mockAuthService,
                },
            ],
        }).compile();

        controller = module.get<AuthController>(AuthController);
        authService = module.get<AuthService>(AuthService);
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    it('should be defined', () => {
        expect(controller).toBeDefined();
    });

    // --- REQUIREMENT 1: LOGIN ENDPOINT ---
    describe('login', () => {
        it('should call authService.login() with valid credentials', async () => {
            const loginDto: LoginDto = { email: 'test@test.com', password: 'password123' };
            const expectedResult = {
                success: true,
                data: {
                    token: 'jwt_token',
                    user: {
                        id: '1',
                        email: 'test@test.com',
                        name: 'Test User',
                        role: UserRole.DONOR,
                    },
                },
            };

            mockAuthService.login.mockResolvedValue(expectedResult);

            const result = await controller.login(loginDto);

            expect(authService.login).toHaveBeenCalledWith(loginDto);
            expect(result).toEqual(expectedResult);
        });
    });

    // --- REQUIREMENT 2: PROFILE ENDPOINT ---
    describe('getProfile', () => {
        it('should return user details excluding password', async () => {
            const userId = '1';
            const mockRequest = { user: { userId } };
            const profileData = {
                id: '1',
                email: 'test@test.com',
                name: 'Test User',
                role: UserRole.DONOR,
                // Password should NOT be here from the service mock
            };

            mockAuthService.getProfile.mockResolvedValue(profileData);

            const result = await controller.getProfile(mockRequest);

            expect(authService.getProfile).toHaveBeenCalledWith(userId);
            expect(result).toEqual(profileData);
            expect(result).not.toHaveProperty('password');
        });
    });

    // --- REQUIREMENT 3: REGISTRATION ENDPOINT ---
    describe('register', () => {
        it('should pass DTO to authService.register()', async () => {
            const registerDto: RegisterDto = {
                email: 'new@test.com',
                password: 'password',
                name: 'New User',
                role: UserRole.DONOR,
                phone: '1234567890',
                address: '123 St',
            };

            const expectedResult = {
                success: true,
                data: {
                    token: 'jwt_token',
                    user: { id: '1', ...registerDto },
                },
            };

            mockAuthService.register.mockResolvedValue(expectedResult);

            // We might need to cast to any if the Controller expects the imported Enum type
            // but usually Enums are compatible if values match or if TS doesn't check nominal typing strictly across files here.
            // However, the Controller signature uses the IMPORTED UserRole.
            // passing the LOCAL UserRole value 'DONOR' (string) should be fine as it matches the value.
            const result = await controller.register(registerDto as any);

            expect(authService.register).toHaveBeenCalledWith(registerDto);
            expect(result).toEqual(expectedResult);
        });
    });
});
