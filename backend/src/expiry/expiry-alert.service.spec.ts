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
    const SYSTEM_TIME = new Date('2026-03-10T12:00:00.000Z');

    beforeEach(() => {
      jest.useFakeTimers().setSystemTime(SYSTEM_TIME);
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    const getFindBounds = () => {
      const calls = mockDonationRepo.find.mock.calls;
      if (calls.length === 0) throw new Error('find not called');
      // The most recent call is the last one
      const operator = calls[calls.length - 1][0].where.expiryTime;
      return (operator.value || operator._value) as [Date, Date];
    };

    const isDateWithinBounds = (targetDate: Date) => {
      const [start, end] = getFindBounds();
      return targetDate.getTime() >= start.getTime() && targetDate.getTime() <= end.getTime();
    };

    describe('1. Expiry Window Calculation', () => {
      it('Verify donation expiring in 90 minutes triggers near-expiry detection', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const ninetyMinsFromNow = new Date(SYSTEM_TIME.getTime() + 90 * 60 * 1000);
        expect(isDateWithinBounds(ninetyMinsFromNow)).toBe(true);
      });

      it('Verify donation expiring in 3 hours does NOT trigger alert', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const threeHoursFromNow = new Date(SYSTEM_TIME.getTime() + 3 * 60 * 60 * 1000);
        expect(isDateWithinBounds(threeHoursFromNow)).toBe(false);
      });
    });

    describe('2. Boundary Conditions', () => {
      it('Exactly 1 hour remaining should trigger alert', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const oneHourFromNow = new Date(SYSTEM_TIME.getTime() + 60 * 60 * 1000);
        expect(isDateWithinBounds(oneHourFromNow)).toBe(true);
      });

      it('Exactly 2 hours remaining should trigger alert', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const twoHoursFromNow = new Date(SYSTEM_TIME.getTime() + 2 * 60 * 60 * 1000);
        expect(isDateWithinBounds(twoHoursFromNow)).toBe(true);
      });

      it('Less than 1 hour should not trigger near-expiry alert', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const fiftyNineMinsFromNow = new Date(SYSTEM_TIME.getTime() + 59 * 60 * 1000);
        expect(isDateWithinBounds(fiftyNineMinsFromNow)).toBe(false);
      });
    });

    describe('3. Service Reliability', () => {
      it('Ensure function returns correct list of near-expiry donations', async () => {
        const mockResult = [
          { id: '1', name: 'Bread', expiryTime: new Date(SYSTEM_TIME.getTime() + 90 * 60 * 1000), status: DonationStatus.AVAILABLE },
        ] as Donation[];
        mockDonationRepo.find.mockResolvedValue(mockResult);

        const result = await service.findNearExpiryDonations();
        expect(result).toEqual(mockResult);
      });

      it('Ensure expired donations are excluded', async () => {
        mockDonationRepo.find.mockResolvedValue([]);
        await service.findNearExpiryDonations();
        const expiredTime = new Date('2023-12-31T12:00:00.000Z');
        expect(isDateWithinBounds(expiredTime)).toBe(false);
      });
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
