import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
    private readonly logger = new Logger(EmailService.name);
    private transporter: nodemailer.Transporter | null = null;
    private readonly isConfigured: boolean;
    private readonly fromAddress: string;

    constructor(private configService: ConfigService) {
        const host = this.configService.get<string>('SMTP_HOST');
        const port = parseInt(this.configService.get<string>('SMTP_PORT') || '587', 10);
        const user = this.configService.get<string>('SMTP_USER');
        const pass = this.configService.get<string>('SMTP_PASS');
        this.fromAddress = this.configService.get<string>('SMTP_FROM') || 'noreply@surplussync.app';

        if (host && user && pass) {
            this.transporter = nodemailer.createTransport({
                host,
                port,
                secure: port === 465,
                auth: { user, pass },
            });
            this.isConfigured = true;
            this.logger.log('✅ Email service configured');
        } else {
            this.isConfigured = false;
            this.logger.warn(
                '⚠️  Email service NOT configured (SMTP_HOST / SMTP_USER / SMTP_PASS missing). ' +
                'Emails will be logged to console only. Add SMTP vars to .env to enable real sending.',
            );
        }
    }

    async sendEmail(to: string, subject: string, html: string): Promise<void> {
        if (!this.isConfigured || !this.transporter) {
            // Explicit log so devs know emails are not being sent
            this.logger.warn(
                `[EMAIL NOT SENT — no SMTP config]\n  To: ${to}\n  Subject: ${subject}`,
            );
            return;
        }

        try {
            await this.transporter.sendMail({
                from: this.fromAddress,
                to,
                subject,
                html,
            });
            this.logger.log(`✅ Email sent to ${to}: "${subject}"`);
        } catch (error) {
            this.logger.error(`❌ Failed to send email to ${to}: ${error.message}`);
            // Don't throw — email failure should never crash the main flow
        }
    }

    async sendNgoVerificationEmail(email: string, orgName: string): Promise<void> {
        await this.sendEmail(
            email,
            '🎉 Your NGO has been verified on SurplusSync',
            `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
          <h2 style="color:#059669">Congratulations, ${orgName}!</h2>
          <p>Your NGO has been <strong>verified</strong> on SurplusSync. You can now claim food donations on the platform.</p>
          <a href="${this.configService.get('FRONTEND_URL') || 'http://localhost:5173'}/dashboard/ngo"
             style="display:inline-block;margin-top:16px;padding:12px 24px;background:#059669;color:#fff;border-radius:8px;text-decoration:none">
            Go to Dashboard
          </a>
        </div>
      `,
        );
    }

    async sendSupportTicketAck(email: string, userName: string, subject: string, ticketId: string): Promise<void> {
        await this.sendEmail(
            email,
            `Support ticket received: ${subject}`,
            `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
          <h2 style="color:#059669">Hi ${userName},</h2>
          <p>We received your support request:</p>
          <blockquote style="border-left:4px solid #059669;padding-left:12px;color:#555">${subject}</blockquote>
          <p>Ticket ID: <strong>${ticketId}</strong></p>
          <p>Our team will respond within 24 hours.</p>
        </div>
      `,
        );
    }

    async sendTicketResolutionEmail(email: string, userName: string, subject: string, adminNote: string): Promise<void> {
        await this.sendEmail(
            email,
            `Your support ticket has been resolved: ${subject}`,
            `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:32px">
          <h2 style="color:#059669">Hi ${userName},</h2>
          <p>Your support ticket has been <strong>resolved</strong>.</p>
          <p><strong>Admin note:</strong> ${adminNote || 'Issue resolved.'}</p>
          <p>If you have further questions, feel free to open a new ticket.</p>
        </div>
      `,
        );
    }
}