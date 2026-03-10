import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { SupportTicketsController } from './support-tickets.controller';
import { User } from '../auth/entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';
import { SupportTicket } from './entities/support-ticket.entity';
import { FlaggedDonation } from './entities/flagged-donation.entity';
import { EmailService } from '../common/email.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Donation, SupportTicket, FlaggedDonation]),
  ],
  controllers: [AdminController, SupportTicketsController],
  providers: [EmailService],
  exports: [EmailService],
})
export class AdminModule {}
