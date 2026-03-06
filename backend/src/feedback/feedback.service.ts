import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DonationFeedback } from './entities/donation-feedback.entity';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { Donation, DonationStatus } from '../donations/entities/donation.entity';

@Injectable()
export class FeedbackService {
    constructor(
        @InjectRepository(DonationFeedback)
        private readonly feedbackRepository: Repository<DonationFeedback>,
        @InjectRepository(Donation)
        private readonly donationRepository: Repository<Donation>,
    ) { }

    async createFeedback(ngoId: string, createFeedbackDto: CreateFeedbackDto): Promise<DonationFeedback> {
        const { donationId, rating, comment } = createFeedbackDto;

        const donation = await this.donationRepository.findOne({
            where: { id: donationId },
        });

        if (!donation) {
            throw new NotFoundException('Donation not found');
        }

        // Usually feedback is only given by the NGO who claimed it
        if (donation.claimedById !== ngoId) {
            throw new BadRequestException('You can only provide feedback for donations you have claimed');
        }

        if (donation.status !== DonationStatus.DELIVERED) {
            throw new BadRequestException('Feedback can only be submitted for delivered donations');
        }

        const existingFeedback = await this.feedbackRepository.findOne({
            where: { donationId, ngoId },
        });

        if (existingFeedback) {
            throw new BadRequestException('Feedback has already been submitted for this donation');
        }

        const feedback = this.feedbackRepository.create({
            donationId,
            ngoId,
            rating,
            comment,
        });

        return await this.feedbackRepository.save(feedback);
    }

    async getFeedbackForDonation(donationId: string): Promise<DonationFeedback[]> {
        return await this.feedbackRepository.find({
            where: { donationId },
            relations: ['ngo'],
        });
    }

    async getAverageRatingForDonor(donorId: string): Promise<{ averageScore: number; totalReviews: number }> {
        // Find all donations created by this donor
        const donorDonations = await this.donationRepository.find({
            where: { donorId },
            select: ['id'], // Only fetch the IDs to optimize performance
        });

        if (donorDonations.length === 0) {
            // No donations mean no feedback
            return { averageScore: 0, totalReviews: 0 };
        }

        const donationIds = donorDonations.map(d => d.id);

        // Fetch all feedback for these donations
        // Using QueryBuilder to handle the IN clause for UUIDs efficiently
        const queryBuilder = this.feedbackRepository.createQueryBuilder('feedback');

        const result = await queryBuilder
            .where('feedback.donationId IN (:...donationIds)', { donationIds })
            .select('AVG(feedback.rating)', 'averageScore')
            .addSelect('COUNT(feedback.id)', 'totalReviews')
            .getRawOne();

        const totalReviews = parseInt(result.totalReviews || '0', 10);
        const averageScore = totalReviews > 0 ? parseFloat(parseFloat(result.averageScore).toFixed(1)) : 0;

        return {
            averageScore,
            totalReviews,
        };
    }
}
