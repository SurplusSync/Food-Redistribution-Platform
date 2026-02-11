import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

jest.mock('bcrypt');

describe('AuthService', () => {
    let service: AuthService;
    let jwtService: JwtService;
    let userRepository: any;

    const mockUserRepository = {
        create: jest.fn(),
        save: jest.fn(),
        findOne: jest.fn(),
        update: jest.fn(),
    };

    const mockJwtService = {
        sign: jest.fn().mockReturnValue('mocked-jwt-token'),
    };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                AuthService,
                { provide: JwtService, useValue: mockJwtService },
                { provide: getRepositoryToken(User), useValue: mockUserRepository },
            ],
        }).compile();

        service = module.get<AuthService>(AuthService);
        jwtService = module.get<JwtService>(JwtService);
        userRepository = module.get(getRepositoryToken(User));
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    describe('register', () => {
        it('should hash password and create user', async () => {
            const registerDto = {
                name: 'Test User',
                email: 'test@example.com',
                password: 'Password123',
                role: UserRole.DONOR,
            };

            const hashedPassword = 'hashed-password';
            const savedUser = {
                id: 'user-1',
                ...registerDto,
                password: hashedPassword,
            };

            mockUserRepository.findOne.mockResolvedValue(null);
            mockUserRepository.create.mockReturnValue(savedUser);
            mockUserRepository.save.mockResolvedValue(savedUser);
            (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

            const result = await service.register(registerDto);

            expect(bcrypt.hash).toHaveBeenCalledWith(registerDto.password, 10);
            expect(userRepository.create).toHaveBeenCalledWith({
                ...registerDto,
                password: hashedPassword,
            });
            expect(result.success).toBe(true);
            expect(result.data.token).toBe('mocked-jwt-token');
        });

        it('should throw ConflictException if email exists', async () => {
            mockUserRepository.findOne.mockResolvedValue({ id: '1' });
            await expect(service.register({ email: 'test@example.com' } as any)).rejects.toThrow(ConflictException);
        });
    });

    describe('login', () => {
        it('should return token on successful login', async () => {
            const loginDto = { email: 'test@example.com', password: 'Password123' };
            const user = {
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
                role: UserRole.DONOR,
            };

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(true);

            const result = await service.login(loginDto);

            expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
            expect(jwtService.sign).toHaveBeenCalled();
            expect(result.success).toBe(true);
            expect(result.data.token).toBe('mocked-jwt-token');
        });

        it('should throw UnauthorizedException on wrong password', async () => {
            const loginDto = { email: 'test@example.com', password: 'WrongPassword' };
            const user = {
                id: 'user-1',
                email: 'test@example.com',
                password: 'hashed-password',
            };

            mockUserRepository.findOne.mockResolvedValue(user);
            (bcrypt.compare as jest.Mock).mockResolvedValue(false);

            await expect(service.login(loginDto)).rejects.toThrow(UnauthorizedException);
        });

        it('should throw UnauthorizedException if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.login({ email: 'unknown@example.com', password: 'pw' })).rejects.toThrow(UnauthorizedException);
        });
    });

    describe('getProfile', () => {
        it('should return user profile without password', async () => {
            const user = { id: '1', name: 'Test', password: 'secret', email: 'test@example.com' };
            mockUserRepository.findOne.mockResolvedValue(user);

            const result = await service.getProfile('1');
            expect(result).not.toHaveProperty('password');
            expect(result.email).toBe(user.email);
        });

        it('should throw exception if user not found', async () => {
            mockUserRepository.findOne.mockResolvedValue(null);
            await expect(service.getProfile('99')).rejects.toThrow(UnauthorizedException);
        });
    });
});
