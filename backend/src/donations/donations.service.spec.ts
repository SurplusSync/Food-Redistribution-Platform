import { Test, TestingModule } from '@nestjs/testing';
import { DonationsService } from './donations.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation, DonationStatus } from './entities/donation.entity';
import { User, UserRole } from '../auth/entities/user.entity';
import { BadRequestException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';

// 1. Create a SHARED mock for QueryBuilder
const mockQueryBuilder = {
  addSelect: jest.fn().mockReturnThis(),
  having: jest.fn().mockReturnThis(),
  setParameters: jest.fn().mockReturnThis(),
  orderBy: jest.fn().mockReturnThis(),
  getMany: jest.fn().mockResolvedValue([{ id: 'geo1', name: 'Nearby Food' }]),
};

const mockEntityManager = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockDonationRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  manager: {
    transaction: jest.fn((cb) => cb(mockEntityManager)),
  },
  // 2. Return the SAME object every time
  createQueryBuilder: jest.fn(() => mockQueryBuilder),
};

const mockUserRepo = {
  findOne: jest.fn(),
  save: jest.fn(),
};

const mockCacheManager = {
  get: jest.fn(),
  set: jest.fn(),
  clear: jest.fn(),
  reset: jest.fn(),
};

describe('DonationsService Unit Tests', () => {
  let service: DonationsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DonationsService,
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: CACHE_MANAGER, useValue: mockCacheManager },
      ],
    }).compile();

    service = module.get<DonationsService>(DonationsService);
  });

  afterEach(() => jest.clearAllMocks());

  // --- TEST SUITE 1: FOOD SAFETY LOGIC ---
  describe('create (Food Safety)', () => {
    it('should block expired food', async () => {
      const pastDate = new Date(Date.now() - 10000).toISOString();
      const dto = {
        name: 'Old Milk',
        foodType: 'packaged',
        quantity: 1,
        expiryTime: pastDate,
        preparationTime: new Date().toISOString(),
      };
      await expect(service.create(dto as any, 'donor1')).rejects.toThrow(BadRequestException);
    });

    it('should enforce 2-hour rule for High Risk (Cooked) food', async () => {
      const oneHourFromNow = new Date(Date.now() + 3600 * 1000).toISOString();
      const dto = {
        name: 'Chicken Curry',
        foodType: 'cooked',
        quantity: 5,
        expiryTime: oneHourFromNow,
        preparationTime: new Date().toISOString(),
      };
      await expect(service.create(dto as any, 'donor1')).rejects.toThrow(/High-risk food/);
    });

    it('should accept valid food', async () => {
      const validDate = new Date(Date.now() + 7200 * 1000).toISOString();
      const dto = {
        name: 'Bread',
        foodType: 'bakery',
        quantity: 10,
        expiryTime: validDate,
        preparationTime: new Date().toISOString(),
      };
      mockDonationRepo.create.mockReturnValue(dto);
      mockDonationRepo.save.mockResolvedValue({ id: 'd1', ...dto, status: DonationStatus.AVAILABLE });

      const result = await service.create(dto as any, 'donor1');
      expect(result.status).toBe(DonationStatus.AVAILABLE);
    });
  });

  // --- TEST SUITE 2: NGO CLAIMING & CAPACITY ---
  describe('claim (Capacity Logic)', () => {
    it('should fail if user is NOT an NGO', async () => {
      mockEntityManager.findOne
        .mockResolvedValueOnce({ id: 'd1', status: DonationStatus.AVAILABLE })
        .mockResolvedValueOnce({ id: 'u1', role: UserRole.DONOR });
      await expect(service.claim('d1', {} as any, 'u1')).rejects.toThrow(/Only NGOs/);
    });

    it('should fail if NGO exceeds Daily Capacity', async () => {
      const heavyDonation = { id: 'd1', quantity: 50, status: DonationStatus.AVAILABLE };
      const fullNgo = {
        id: 'u1',
        role: UserRole.NGO,
        isVerified: true,
        currentIntakeLoad: 80,
        dailyIntakeCapacity: 100,
      };
      mockEntityManager.findOne.mockResolvedValueOnce(heavyDonation).mockResolvedValueOnce(fullNgo);
      await expect(service.claim('d1', {} as any, 'u1')).rejects.toThrow(/Claim exceeds daily intake capacity/);
    });

    it('should succeed and lock donation if capacity is sufficient', async () => {
      const donation = { id: 'd1', quantity: 10, status: DonationStatus.AVAILABLE };
      const ngo = {
        id: 'u1',
        role: UserRole.NGO,
        isVerified: true,
        currentIntakeLoad: 50,
        dailyIntakeCapacity: 100,
      };
      mockEntityManager.findOne.mockResolvedValueOnce(donation).mockResolvedValueOnce(ngo);
      mockEntityManager.save.mockImplementation((entity) => Promise.resolve(entity));
      
      const result = await service.claim('d1', {} as any, 'u1');
      expect(result.status).toBe(DonationStatus.CLAIMED);
    });
  });

  // --- TEST SUITE 3: VOLUNTEER WORKFLOW ---
  describe('updateStatus (Volunteer Flow)', () => {
    it('should allow Volunteer to Pickup claimed food', async () => {
      const donation = { id: 'd1', status: DonationStatus.CLAIMED, claimedById: 'ngo1', donorId: 'donor1' };
      const volunteer = { id: 'vol1', role: UserRole.VOLUNTEER };
      mockEntityManager.findOne.mockResolvedValueOnce(donation).mockResolvedValueOnce(volunteer);
      mockEntityManager.save.mockResolvedValue({ ...donation, status: DonationStatus.PICKED_UP });

      const result = await service.updateStatus('d1', DonationStatus.PICKED_UP, 'vol1');
      expect(result.status).toBe(DonationStatus.PICKED_UP);
    });

    it('should fail if unauthorized user tries to update', async () => {
      const donation = { id: 'd1', status: DonationStatus.CLAIMED, claimedById: 'ngo1' };
      const rando = { id: 'rando1', role: UserRole.DONOR };
      mockEntityManager.findOne.mockResolvedValueOnce(donation).mockResolvedValueOnce(rando);
      await expect(service.updateStatus('d1', DonationStatus.PICKED_UP, 'rando1')).rejects.toThrow(/not authorized/);
    });
  });

  // --- TEST SUITE 4: GEOSPATIAL DISCOVERY ---
  describe('findAll (Discovery)', () => {
    it('should use QueryBuilder (Haversine) when lat/lon are provided', async () => {
      await service.findAll(12.97, 77.59, 5); 

      // 3. 👇 Check against the SHARED mock
      expect(mockDonationRepo.createQueryBuilder).toHaveBeenCalled();
      expect(mockQueryBuilder.addSelect).toHaveBeenCalledWith(
        expect.stringContaining('6371 * acos'), 
        'distance'
      );
    });

    it('should use standard find() when no location is provided', async () => {
      await service.findAll();
      expect(mockDonationRepo.find).toHaveBeenCalled();
      expect(mockDonationRepo.createQueryBuilder).not.toHaveBeenCalled();
    });
  });
});