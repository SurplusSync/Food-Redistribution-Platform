import { Test, TestingModule } from '@nestjs/testing';
import { ExpiryAlertService } from './expiry-alert.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';
import { User } from '../auth/entities/user.entity';
import { EventsGateway } from '../events/events.gateway';
import { EmailService } from '../common/email.service';

const mockDonationRepo = {
  find: jest.fn(),
};

const mockUserRepo = {
  findOne: jest.fn(),
};

const mockEventsGateway = {
  emitNearExpiryAlert: jest.fn(),
};

const mockEmailService = {
  sendEmail: jest.fn().mockResolvedValue(undefined),
};

describe('ExpiryAlertService', () => {
  let service: ExpiryAlertService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExpiryAlertService,
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
        { provide: EventsGateway, useValue: mockEventsGateway },
        { provide: EmailService, useValue: mockEmailService },
      ],
    }).compile();

    service = module.get<ExpiryAlertService>(ExpiryAlertService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── findNearExpiryDonations ───────────────────
  describe('findNearExpiryDonations', () => {
    it('should query donations expiring within 1-2 hours', async () => {
      mockDonationRepo.find.mockResolvedValue([]);

      await service.findNearExpiryDonations();

      expect(mockDonationRepo.find).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            status: expect.anything(),
            expiryTime: expect.anything(),
          }),
          relations: ['donor'],
        }),
      );
    });

    it('should return matching donations', async () => {
      const donations = [
        { id: 'd1', name: 'Rice', expiryTime: new Date(), donor: { email: 'a@b.com' } },
      ];
      mockDonationRepo.find.mockResolvedValue(donations);

      const result = await service.findNearExpiryDonations();

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('d1');
    });
  });

  // ── processNearExpiryDonations ────────────────
  describe('processNearExpiryDonations', () => {
    it('should do nothing when no donations are near expiry', async () => {
      mockDonationRepo.find.mockResolvedValue([]);

      await service.processNearExpiryDonations();

      expect(mockEventsGateway.emitNearExpiryAlert).not.toHaveBeenCalled();
      expect(mockEmailService.sendEmail).not.toHaveBeenCalled();
    });

    it('should emit WebSocket alert and email donor for each near-expiry donation', async () => {
      const donations = [
        {
          id: 'd1',
          name: 'Bread',
          expiryTime: new Date('2026-03-10T16:00:00'),
          donor: { email: 'donor@test.com' },
          claimedById: null,
        },
      ];
      mockDonationRepo.find.mockResolvedValue(donations);

      await service.processNearExpiryDonations();

      expect(mockEventsGateway.emitNearExpiryAlert).toHaveBeenCalledWith({
        donationId: 'd1',
        expiryTime: donations[0].expiryTime,
      });
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'donor@test.com',
        expect.stringContaining('Expiring Soon'),
        expect.stringContaining('Bread'),
      );
    });

    it('should email the claiming NGO when donation is claimed', async () => {
      const donations = [
        {
          id: 'd2',
          name: 'Curry',
          expiryTime: new Date('2026-03-10T17:00:00'),
          donor: { email: 'donor@test.com' },
          claimedById: 'ngo1',
        },
      ];
      mockDonationRepo.find.mockResolvedValue(donations);
      mockUserRepo.findOne.mockResolvedValue({ id: 'ngo1', email: 'ngo@test.com' });

      await service.processNearExpiryDonations();

      // Donor email
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'donor@test.com',
        expect.any(String),
        expect.any(String),
      );
      // NGO email
      expect(mockEmailService.sendEmail).toHaveBeenCalledWith(
        'ngo@test.com',
        expect.stringContaining('Claimed Food Expiring'),
        expect.stringContaining('Curry'),
      );
    });

    it('should skip NGO email when claimed NGO has no email', async () => {
      const donations = [
        {
          id: 'd3',
          name: 'Milk',
          expiryTime: new Date(),
          donor: { email: 'donor@test.com' },
          claimedById: 'ngo2',
        },
      ];
      mockDonationRepo.find.mockResolvedValue(donations);
      mockUserRepo.findOne.mockResolvedValue({ id: 'ngo2', email: null });

      await service.processNearExpiryDonations();

      // Only donor email should be sent (1 call)
      expect(mockEmailService.sendEmail).toHaveBeenCalledTimes(1);
    });

    it('should handle errors gracefully without throwing', async () => {
      mockDonationRepo.find.mockRejectedValue(new Error('DB error'));

      // Should not throw
      await expect(service.processNearExpiryDonations()).resolves.toBeUndefined();
    });
  });
});
