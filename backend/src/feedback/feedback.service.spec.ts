import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackService } from './feedback.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DonationFeedback } from './entities/donation-feedback.entity';
import {
  Donation,
  DonationStatus,
} from '../donations/entities/donation.entity';
import { User } from '../auth/entities/user.entity';
import { NotFoundException } from '@nestjs/common';

const mockFeedbackRepo = {
  create: jest.fn(),
  save: jest.fn(),
  find: jest.fn(),
  findOne: jest.fn(),
  createQueryBuilder: jest.fn(),
};

const mockDonationRepo = {
  findOne: jest.fn(),
  find: jest.fn(),
};

const mockUserRepo = {
  update: jest.fn(),
};

describe('FeedbackService', () => {
  let service: FeedbackService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FeedbackService,
        {
          provide: getRepositoryToken(DonationFeedback),
          useValue: mockFeedbackRepo,
        },
        { provide: getRepositoryToken(Donation), useValue: mockDonationRepo },
        { provide: getRepositoryToken(User), useValue: mockUserRepo },
      ],
    }).compile();

    service = module.get<FeedbackService>(FeedbackService);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  // ── createFeedback ────────────────────────────
  describe('createFeedback', () => {
    const dto = { donationId: 'd1', rating: 5, comment: 'Great quality!' };

    it('should throw NotFoundException if donation does not exist', async () => {
      mockDonationRepo.findOne.mockResolvedValue(null);

      await expect(service.createFeedback('ngo1', dto)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw BadRequestException if NGO did not claim the donation', async () => {
      mockDonationRepo.findOne.mockResolvedValue({
        id: 'd1',
        claimedById: 'other-ngo',
        status: DonationStatus.DELIVERED,
      });

      await expect(service.createFeedback('ngo1', dto)).rejects.toThrow(
        /You can only provide feedback for donations you have claimed/,
      );
    });

    it('should throw BadRequestException if donation is not delivered', async () => {
      mockDonationRepo.findOne.mockResolvedValue({
        id: 'd1',
        claimedById: 'ngo1',
        status: DonationStatus.CLAIMED,
      });

      await expect(service.createFeedback('ngo1', dto)).rejects.toThrow(
        /Feedback can only be submitted for delivered donations/,
      );
    });

    it('should throw BadRequestException if feedback already exists', async () => {
      mockDonationRepo.findOne.mockResolvedValue({
        id: 'd1',
        claimedById: 'ngo1',
        status: DonationStatus.DELIVERED,
        donorId: 'donor1',
      });
      mockFeedbackRepo.findOne.mockResolvedValue({ id: 'existing-fb' });

      await expect(service.createFeedback('ngo1', dto)).rejects.toThrow(
        /Feedback has already been submitted/,
      );
    });

    it('should create feedback and update donor trustScore', async () => {
      mockDonationRepo.findOne.mockResolvedValue({
        id: 'd1',
        claimedById: 'ngo1',
        status: DonationStatus.DELIVERED,
        donorId: 'donor1',
      });
      mockFeedbackRepo.findOne.mockResolvedValue(null);

      const savedFeedback = {
        id: 'fb1',
        donationId: 'd1',
        ngoId: 'ngo1',
        rating: 5,
        comment: 'Great quality!',
      };
      mockFeedbackRepo.create.mockReturnValue(savedFeedback);
      mockFeedbackRepo.save.mockResolvedValue(savedFeedback);

      // Mock getAverageRatingForDonor internals
      mockDonationRepo.find.mockResolvedValue([{ id: 'd1' }]);
      const mockQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ averageScore: '4.5', totalReviews: '2' }),
      };
      mockFeedbackRepo.createQueryBuilder.mockReturnValue(mockQb);
      mockUserRepo.update.mockResolvedValue({ affected: 1 });

      const result = await service.createFeedback('ngo1', dto);

      expect(result.id).toBe('fb1');
      expect(mockFeedbackRepo.create).toHaveBeenCalledWith({
        donationId: 'd1',
        ngoId: 'ngo1',
        rating: 5,
        comment: 'Great quality!',
      });
      expect(mockUserRepo.update).toHaveBeenCalledWith('donor1', {
        trustScore: 4.5,
      });
    });
  });

  // ── getFeedbackForDonation ────────────────────
  describe('getFeedbackForDonation', () => {
    it('should return feedback for a donation with NGO relations', async () => {
      const feedbacks = [{ id: 'fb1', rating: 4, ngo: { name: 'Food Bank' } }];
      mockFeedbackRepo.find.mockResolvedValue(feedbacks);

      const result = await service.getFeedbackForDonation('d1');

      expect(mockFeedbackRepo.find).toHaveBeenCalledWith({
        where: { donationId: 'd1' },
        relations: ['ngo'],
      });
      expect(result).toEqual(feedbacks);
    });
  });

  // ── getAverageRatingForDonor ──────────────────
  describe('getAverageRatingForDonor', () => {
    it('should return zero when donor has no donations', async () => {
      mockDonationRepo.find.mockResolvedValue([]);

      const result = await service.getAverageRatingForDonor('donor1');

      expect(result).toEqual({ averageScore: 0, totalReviews: 0 });
    });

    it('should calculate average rating from feedbacks', async () => {
      mockDonationRepo.find.mockResolvedValue([{ id: 'd1' }, { id: 'd2' }]);

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ averageScore: '3.7', totalReviews: '5' }),
      };
      mockFeedbackRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getAverageRatingForDonor('donor1');

      expect(result.averageScore).toBe(3.7);
      expect(result.totalReviews).toBe(5);
      expect(mockQb.where).toHaveBeenCalledWith(
        'feedback.donationId IN (:...donationIds)',
        { donationIds: ['d1', 'd2'] },
      );
    });

    it('should return zero when no reviews exist', async () => {
      mockDonationRepo.find.mockResolvedValue([{ id: 'd1' }]);

      const mockQb = {
        where: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        addSelect: jest.fn().mockReturnThis(),
        getRawOne: jest
          .fn()
          .mockResolvedValue({ averageScore: null, totalReviews: '0' }),
      };
      mockFeedbackRepo.createQueryBuilder.mockReturnValue(mockQb);

      const result = await service.getAverageRatingForDonor('donor1');

      expect(result).toEqual({ averageScore: 0, totalReviews: 0 });
    });
  });
});
