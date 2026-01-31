import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Donation } from './entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Donation])], // Gives Service access to Donation Table
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}