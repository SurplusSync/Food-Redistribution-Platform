import { Test, TestingModule } from '@nestjs/testing';
import { AdminController } from './admin.controller';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';
import { NotFoundException } from '@nestjs/common';

describe('AdminController', () => {
  let controller: AdminController;

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockDonationRepository = {
    find: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdminController],
      providers: [
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
        {
          provide: getRepositoryToken(Donation),
          useValue: mockDonationRepository,
        },
      ],
    }).compile();

    controller = module.get<AdminController>(AdminController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getPendingNGOs', () => {
    it('should return list of unverified NGOs', async () => {
      const mockNGOs = [
        {
          id: '1',
          name: 'Food Bank A',
          email: 'foodbank@example.com',
          role: UserRole.NGO,
          isVerified: false,
          organizationName: 'Food Bank A',
          phone: '1234567890',
          address: '123 Main St',
          createdAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockNGOs);

      const result = await controller.getPendingNgos();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        where: {
          role: UserRole.NGO,
          isVerified: false,
        },
        select: [
          'id',
          'name',
          'email',
          'organizationName',
          'phone',
          'address',
          'certificateUrl',
          'createdAt',
        ],
      });
      expect(result).toEqual(mockNGOs);
    });
  });

  describe('verifyNgo', () => {
    it('should verify an NGO and update isVerified to true', async () => {
      const ngoId = '123';
      const mockNGO = {
        id: ngoId,
        name: 'Food Bank A',
        organizationName: 'Food Bank A',
        isVerified: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockNGO);
      mockUserRepository.save.mockResolvedValue({
        ...mockNGO,
        isVerified: true,
      });

      const result = await controller.verifyNgo(ngoId);

      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { id: ngoId },
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockNGO,
        isVerified: true,
      });
      expect(result.message).toContain('verified');
    });

    it('should throw NotFoundException if NGO does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(controller.verifyNgo('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllUsers', () => {
    it('should return all users with specific fields', async () => {
      const mockUsers = [
        {
          id: '1',
          name: 'John Donor',
          email: 'john@example.com',
          role: UserRole.DONOR,
          isVerified: true,
          isActive: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          name: 'NGO Helper',
          email: 'ngo@example.com',
          role: UserRole.NGO,
          organizationName: 'Helper Org',
          isVerified: false,
          isActive: true,
          createdAt: new Date(),
        },
      ];

      mockUserRepository.find.mockResolvedValue(mockUsers);

      const result = await controller.getAllUsers();

      expect(mockUserRepository.find).toHaveBeenCalledWith({
        select: [
          'id',
          'name',
          'email',
          'role',
          'organizationName',
          'isVerified',
          'isActive',
          'createdAt',
        ],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockUsers);
    });
  });

  describe('toggleUserStatus', () => {
    it('should suspend an active user', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        role: UserRole.DONOR,
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      const result = await controller.toggleUserStatus(userId);

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        isActive: false,
      });
      expect(result.message).toContain('suspended');
      expect(result.isActive).toBe(false);
    });

    it('should restore a suspended user', async () => {
      const userId = '123';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        role: UserRole.DONOR,
        isActive: false,
      };

      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockUserRepository.save.mockResolvedValue({
        ...mockUser,
        isActive: true,
      });

      const result = await controller.toggleUserStatus(userId);

      expect(mockUserRepository.save).toHaveBeenCalledWith({
        ...mockUser,
        isActive: true,
      });
      expect(result.message).toContain('unbanned');
      expect(result.isActive).toBe(true);
    });

    it('should prevent suspending an admin account', async () => {
      const adminUser = {
        id: 'admin-123',
        name: 'System Admin',
        role: UserRole.ADMIN,
        isActive: true,
      };

      mockUserRepository.findOne.mockResolvedValue(adminUser);

      await expect(controller.toggleUserStatus('admin-123')).rejects.toThrow(
        'Cannot suspend an administrator account',
      );
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(controller.toggleUserStatus('invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getAllDonations', () => {
    it('should return all donations with donor relations', async () => {
      const mockDonations = [
        {
          id: '1',
          name: 'Rice',
          quantity: 50,
          unit: 'kg',
          status: 'AVAILABLE',
          donor: {
            id: 'donor-1',
            name: 'Restaurant A',
          },
          createdAt: new Date(),
        },
      ];

      mockDonationRepository.find.mockResolvedValue(mockDonations);

      const result = await controller.getAllDonations();

      expect(mockDonationRepository.find).toHaveBeenCalledWith({
        relations: ['donor'],
        order: { createdAt: 'DESC' },
      });
      expect(result).toEqual(mockDonations);
    });
  });
});
