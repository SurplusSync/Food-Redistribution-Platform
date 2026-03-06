import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FeedbackService } from './feedback.service';
import { FeedbackController } from './feedback.controller';
import { DonationFeedback } from './entities/donation-feedback.entity';
import { Donation } from '../donations/entities/donation.entity';

@Module({
    imports: [TypeOrmModule.forFeature([DonationFeedback, Donation])],
    controllers: [FeedbackController],
    providers: [FeedbackService],
    exports: [FeedbackService],
})
export class FeedbackModule { }
