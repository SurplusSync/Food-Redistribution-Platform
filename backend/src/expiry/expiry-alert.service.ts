import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cron } from '@nestjs/schedule';
import {
  Donation,
  DonationStatus,
} from '../donations/entities/donation.entity';
import { User } from '../auth/entities/user.entity';
import { EventsGateway } from '../events/events.gateway';
import { EmailService } from '../common/email.service';

@Injectable()
export class ExpiryAlertService {
  private readonly logger = new Logger(ExpiryAlertService.name);

  constructor(
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private eventsGateway: EventsGateway,
    private emailService: EmailService,
  ) {}

  async findNearExpiryDonations(): Promise<Donation[]> {
    const currentTime = new Date();
    const oneHourFromNow = new Date(currentTime.getTime() + 60 * 60 * 1000);
    const twoHoursFromNow = new Date(
      currentTime.getTime() + 2 * 60 * 60 * 1000,
    );

    return await this.donationsRepository.find({
      where: {
        status: In([DonationStatus.AVAILABLE, DonationStatus.CLAIMED]),
        expiryTime: Between(oneHourFromNow, twoHoursFromNow),
      },
      relations: ['donor'],
    });
  }

  @Cron('*/10 * * * *')
  async processNearExpiryDonations(): Promise<void> {
    this.logger.log('Checking for donations expiring in 1-2 hours...');
    try {
      const nearExpiryDonations = await this.findNearExpiryDonations();

      if (nearExpiryDonations.length === 0) {
        return;
      }

      this.logger.log(
        `Found ${nearExpiryDonations.length} donation(s) nearing expiry (1-2 hours).`,
      );

      for (const donation of nearExpiryDonations) {
        // 1. Emit WebSocket Event
        this.eventsGateway.emitNearExpiryAlert({
          donationId: donation.id,
          expiryTime: donation.expiryTime,
        });

        const payload = {
          donationId: donation.id,
          donationName: donation.name,
          expiryTime: donation.expiryTime,
        };

        // 2. Send Email to Donor
        if (donation.donor && donation.donor.email) {
          await this.emailService.sendEmail(
            donation.donor.email,
            '⏰ Food Listing Expiring Soon',
            `
            <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
              <h2 style="color:#d97706">Expiry Alert</h2>
              <p>Hello Donor,</p>
              <p>Your food listing is expiring soon:</p>
              <ul>
                <li><strong>Item:</strong> ${payload.donationName}</li>
                <li><strong>Expiry:</strong> ${payload.expiryTime.toLocaleString()}</li>
              </ul>
              <p>Please take necessary actions.</p>
            </div>`,
          );
        }

        // 3. Send Email to NGO if claimed
        if (donation.claimedById) {
          const claimedNgo = await this.usersRepository.findOne({
            where: { id: donation.claimedById },
          });
          if (claimedNgo && claimedNgo.email) {
            await this.emailService.sendEmail(
              claimedNgo.email,
              '⏰ Claimed Food Expiring Soon',
              `
              <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
                <h2 style="color:#d97706">Expiry Alert</h2>
                <p>Hello NGO,</p>
                <p>A food item you claimed is expiring soon:</p>
                <ul>
                  <li><strong>Item:</strong> ${payload.donationName}</li>
                  <li><strong>Expiry:</strong> ${payload.expiryTime.toLocaleString()}</li>
                </ul>
                <p>Please arrange pickup as soon as possible.</p>
              </div>`,
            );
          }
        }
      }
    } catch (error) {
      this.logger.error('Error processing near-expiry donations', error);
    }
  }
}
