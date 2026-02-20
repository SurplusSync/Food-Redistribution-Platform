import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';
import { UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

// 1. Mock the entire bcrypt library here
jest.mock('bcrypt');

const mockUserRepo = {
  findOne: jest.fn(),
  create: jest.fn(),
  save: jest.fn(),
  update: jest.fn(), // 👈 Added this for Profile Tests
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('fake_jwt_token'),
};

const mockDonationRepo = {
  find: jest.fn().mockResolvedValue([]),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  afterEach(() => jest.clearAllMocks());

  describe('login', () => {
    it('should return token if validation succeeds', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        password: 'hashed_password',
        role: 'donor' 
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await service.login({ email: 'test@test.com', password: 'password123' });

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('fake_jwt_token');
      expect(result.data.user.email).toBe('test@test.com');
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const mockUser = { 
        id: '1', 
        email: 'test@test.com', 
        password: 'hashed_password' 
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login({ email: 'test@test.com', password: 'wrong' }))
        .rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);

      await expect(service.login({ email: 'unknown@test.com', password: 'any' }))
        .rejects.toThrow(UnauthorizedException);
    });
  });

  describe('register', () => {
    it('should successfully register a new user', async () => {
      const registerDto = { 
        email: 'new@test.com', 
        password: 'pass', 
        name: 'New User', 
        role: 'donor',
        phone: '1234567890',
        address: '123 St',
        organizationName: 'Org',
        organizationType: 'Restaurant'
      };

      mockUserRepo.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_pass');
      
      mockUserRepo.create.mockReturnValue({ id: '1', ...registerDto, password: 'hashed_pass' });
      mockUserRepo.save.mockResolvedValue({ id: '1', ...registerDto });

      const result = await service.register(registerDto as any);

      expect(result.success).toBe(true);
      expect(result.data.token).toBe('fake_jwt_token');
      expect(mockUserRepo.save).toHaveBeenCalled();
    });

    it('should fail if email already exists', async () => {
      mockUserRepo.findOne.mockResolvedValue({ id: '1', email: 'existing@test.com' });

      await expect(service.register({ email: 'existing@test.com', password: 'pass' } as any))
        .rejects.toThrow(ConflictException);
    });
  });

  // --- TEST SUITE 3: PROFILE MANAGEMENT (NEW) ---
  describe('getProfile', () => {
    it('should return user details WITHOUT password', async () => {
      const mockUser = { 
        id: '1', 
        email: 'me@test.com', 
        password: 'secret_hash', 
        name: 'My Name' 
      };

      mockUserRepo.findOne.mockResolvedValue(mockUser);

      const result = await service.getProfile('1');

      expect(result).toHaveProperty('email', 'me@test.com');
      expect(result).not.toHaveProperty('password'); // 🔐 Security Check
    });

    it('should throw error if user not found', async () => {
      mockUserRepo.findOne.mockResolvedValue(null);
      await expect(service.getProfile('99')).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    it('should update user and return new profile', async () => {
      const updateDto = { name: 'Updated Name' };
      const updatedUser = { id: '1', email: 'me@test.com', name: 'Updated Name' };

      mockUserRepo.update.mockResolvedValue({ affected: 1 });
      mockUserRepo.findOne.mockResolvedValue(updatedUser);

      const result = await service.updateProfile('1', updateDto);

      expect(mockUserRepo.update).toHaveBeenCalledWith('1', updateDto);
      expect(result.data.name).toBe('Updated Name');
    });
  });
});