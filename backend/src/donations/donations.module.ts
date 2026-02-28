import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DonationsService } from './donations.service';
import { DonationsController } from './donations.controller';
import { Donation } from './entities/donation.entity';
import { User } from '../auth/entities/user.entity';
import { CloudinaryService } from '../common/cloudinary.service';
import { AuthModule } from '../auth/auth.module';
import { EventsModule } from '../events/events.module';
import { RedisService } from '../common/redis.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Donation, User]),
    AuthModule,
    EventsModule,
  ], // Gives Service access to Donation Table
  controllers: [DonationsController],
  providers: [DonationsService, CloudinaryService, RedisService],
})
export class DonationsModule {}
