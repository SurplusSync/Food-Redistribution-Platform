import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Donation } from '../donations/entities/donation.entity';
import { User } from '../auth/entities/user.entity';
import { ExpiryAlertService } from './expiry-alert.service';
import { BasicMailerService } from './basic-mailer.service';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [TypeOrmModule.forFeature([Donation, User]), EventsModule],
  providers: [ExpiryAlertService, BasicMailerService],
})
export class ExpiryModule {}
