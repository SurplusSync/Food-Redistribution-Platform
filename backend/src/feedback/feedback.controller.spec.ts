import { Test, TestingModule } from '@nestjs/testing';
import { FeedbackController } from './feedback.controller';
import { FeedbackService } from './feedback.service';
import { ForbiddenException } from '@nestjs/common';
import { UserRole } from '../auth/entities/user.entity';

const mockFeedbackService = {
  createFeedback: jest.fn(),
  getFeedbackForDonation: jest.fn(),
  getAverageRatingForDonor: jest.fn(),
};

describe('FeedbackController', () => {
  let controller: FeedbackController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FeedbackController],
      providers: [{ provide: FeedbackService, useValue: mockFeedbackService }],
    }).compile();

    controller = module.get<FeedbackController>(FeedbackController);
  });

  afterEach(() => jest.clearAllMocks());

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('createFeedback', () => {
    const dto = { donationId: 'd1', rating: 4, comment: 'Good' };

    it('should throw ForbiddenException if user is not an NGO', async () => {
      const req = { user: { role: UserRole.DONOR, userId: 'u1' } };

      await expect(controller.createFeedback(req, dto)).rejects.toThrow(
        ForbiddenException,
      );
    });

    it('should create feedback when user is an NGO', async () => {
      const req = { user: { role: UserRole.NGO, userId: 'ngo1' } };
      const saved = { id: 'fb1', ...dto, ngoId: 'ngo1' };
      mockFeedbackService.createFeedback.mockResolvedValue(saved);

      const result = await controller.createFeedback(req, dto);

      expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith(
        'ngo1',
        dto,
      );
      expect(result.id).toBe('fb1');
    });

    it('should use req.user.id as fallback when userId is not set', async () => {
      const req = { user: { role: UserRole.NGO, id: 'ngo-fallback' } };
      mockFeedbackService.createFeedback.mockResolvedValue({ id: 'fb2' });

      await controller.createFeedback(req, dto);

      expect(mockFeedbackService.createFeedback).toHaveBeenCalledWith(
        'ngo-fallback',
        dto,
      );
    });
  });

  describe('getFeedbackForDonation', () => {
    it('should return feedback for a donation', async () => {
      const feedbacks = [{ id: 'fb1', rating: 5 }];
      mockFeedbackService.getFeedbackForDonation.mockResolvedValue(feedbacks);

      const result = await controller.getFeedbackForDonation('d1');

      expect(mockFeedbackService.getFeedbackForDonation).toHaveBeenCalledWith(
        'd1',
      );
      expect(result).toEqual(feedbacks);
    });
  });

  describe('getAverageRatingForDonor', () => {
    it('should return average rating for a donor', async () => {
      const avg = { averageScore: 4.2, totalReviews: 10 };
      mockFeedbackService.getAverageRatingForDonor.mockResolvedValue(avg);

      const result = await controller.getAverageRatingForDonor('donor1');

      expect(mockFeedbackService.getAverageRatingForDonor).toHaveBeenCalledWith(
        'donor1',
      );
      expect(result).toEqual(avg);
    });
  });
});
