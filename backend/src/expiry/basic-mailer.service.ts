import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BasicMailerService {
  private readonly logger = new Logger(BasicMailerService.name);

  async sendExpiryEmail(
    to: string,
    role: string,
    payload: { donationId: string; donationName: string; expiryTime: Date },
  ) {
    const subject = 'Food Listing Expiring Soon';
    const message = `
Hello ${role},

The following food item is expiring soon:
- Food Item: ${payload.donationName}
- Expiry Time: ${payload.expiryTime.toLocaleString()}
- Donation ID: ${payload.donationId}

Please take necessary actions.
        `;

    // Simulate sending email by logging
    this.logger.log(`[EMAIL SENT] To: ${to} | Subject: ${subject}`);
    this.logger.debug(`Email Content:\n${message}`);
  }
}
