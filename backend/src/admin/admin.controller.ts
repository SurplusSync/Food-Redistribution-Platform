import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseGuards,
  NotFoundException,
  Req,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';
import {
  SupportTicket,
  TicketStatus,
  TicketPriority,
} from './entities/support-ticket.entity';
import {
  FlaggedDonation,
  FlagStatus,
} from './entities/flagged-donation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { EmailService } from '../common/email.service';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('Admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    @InjectRepository(FlaggedDonation)
    private flagRepository: Repository<FlaggedDonation>,
    private emailService: EmailService,
  ) {}

  // ─── NGO Verification ───────────────────────────────────────────────────────

  @Get('pending-ngos')
  @ApiOperation({ summary: 'Get all NGOs awaiting approval' })
  async getPendingNgos() {
    return await this.userRepository.find({
      where: { role: UserRole.NGO, isVerified: false },
      select: [
        'id',
        'name',
        'email',
        'organizationName',
        'phone',
        'address',
        'certificateUrl',
        'createdAt',
      ],
    });
  }

  @Patch('verify/:id')
  @ApiOperation({ summary: 'Approve and verify an NGO' })
  async verifyNgo(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    user.isVerified = true;
    await this.userRepository.save(user);

    // Send verification email (non-blocking)
    this.emailService.sendNgoVerificationEmail(
      user.email,
      user.organizationName || user.name,
    );

    return {
      message: `${user.organizationName || user.name} has been successfully verified!`,
      user,
    };
  }

  // ─── User Management ────────────────────────────────────────────────────────

  @Get('users')
  @ApiOperation({ summary: 'Get all platform users' })
  async getAllUsers() {
    return await this.userRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'organizationName',
        'isVerified',
        'isActive',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  @Patch('users/:id/toggle-status')
  @ApiOperation({ summary: 'Suspend or restore a user account' })
  async toggleUserStatus(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === UserRole.ADMIN)
      throw new Error('Cannot suspend an administrator account');

    user.isActive = !user.isActive;
    await this.userRepository.save(user);

    return {
      message: `User ${user.name} has been ${user.isActive ? 'unbanned' : 'suspended'}.`,
      isActive: user.isActive,
    };
  }

  // ─── Donations Overview ──────────────────────────────────────────────────────

  @Get('donations')
  @ApiOperation({ summary: 'Get all platform donations' })
  async getAllDonations() {
    return await this.donationRepository.find({
      relations: ['donor'],
      order: { createdAt: 'DESC' },
    });
  }

  // ─── Support Tickets ─────────────────────────────────────────────────────────

  @Get('tickets')
  @ApiOperation({ summary: 'Get all support tickets' })
  async getAllTickets() {
    return await this.ticketRepository.find({ order: { createdAt: 'DESC' } });
  }

  @Post('tickets')
  @ApiOperation({ summary: 'Create a support ticket (any authenticated user)' })
  async createTicket(
    @Req() req: any,
    @Body()
    body: { subject: string; description: string; priority?: TicketPriority },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });
    if (!user) throw new NotFoundException('User not found');

    const ticket = this.ticketRepository.create({
      userId: user.id,
      userEmail: user.email,
      userName: user.organizationName || user.name,
      subject: body.subject,
      description: body.description,
      priority: body.priority || TicketPriority.MEDIUM,
    });

    const saved = await this.ticketRepository.save(ticket);

    // Send acknowledgement email
    this.emailService.sendSupportTicketAck(
      user.email,
      user.name,
      body.subject,
      saved.id,
    );

    return saved;
  }

  @Patch('tickets/:id')
  @ApiOperation({ summary: 'Update ticket status or add admin note' })
  async updateTicket(
    @Param('id') id: string,
    @Body() body: { status?: TicketStatus; adminNote?: string },
  ) {
    const ticket = await this.ticketRepository.findOne({ where: { id } });
    if (!ticket) throw new NotFoundException('Ticket not found');

    if (body.status) ticket.status = body.status;
    if (body.adminNote !== undefined) ticket.adminNote = body.adminNote;

    const saved = await this.ticketRepository.save(ticket);

    // Notify user if resolved
    if (body.status === TicketStatus.RESOLVED) {
      this.emailService.sendTicketResolutionEmail(
        ticket.userEmail,
        ticket.userName,
        ticket.subject,
        body.adminNote || '',
      );
    }

    return saved;
  }

  // ─── Flagged Food ────────────────────────────────────────────────────────────

  @Get('flagged')
  @ApiOperation({ summary: 'Get all flagged donations' })
  async getFlaggedDonations() {
    return await this.flagRepository.find({ order: { createdAt: 'DESC' } });
  }

  @Post('flagged')
  @ApiOperation({ summary: 'Flag a donation for review' })
  async flagDonation(
    @Req() req: any,
    @Body() body: { donationId: string; reason: string },
  ) {
    const user = await this.userRepository.findOne({
      where: { id: req.user.userId },
    });
    const donation = await this.donationRepository.findOne({
      where: { id: body.donationId },
    });

    if (!donation) throw new NotFoundException('Donation not found');

    const flag = this.flagRepository.create({
      donationId: body.donationId,
      donationName: donation.name,
      reportedByUserId: req.user.userId,
      reportedByEmail: user?.email || 'unknown',
      reason: body.reason,
    });

    return await this.flagRepository.save(flag);
  }

  @Patch('flagged/:id')
  @ApiOperation({
    summary: 'Admin decision on flagged donation: approve / reject / escalate',
  })
  async updateFlaggedDonation(
    @Param('id') id: string,
    @Body() body: { status: FlagStatus; adminNote?: string },
  ) {
    const flag = await this.flagRepository.findOne({ where: { id } });
    if (!flag) throw new NotFoundException('Flagged donation not found');

    flag.status = body.status;
    if (body.adminNote) flag.adminNote = body.adminNote;

    return await this.flagRepository.save(flag);
  }

  // ─── Admin Notifications ─────────────────────────────────────────────────────

  @Get('notifications')
  @ApiOperation({
    summary: 'Get admin notifications (recent activity summary)',
  })
  async getAdminNotifications() {
    const [pendingNgos, openTickets, flaggedCount, recentDonations] =
      await Promise.all([
        this.userRepository.count({
          where: { role: UserRole.NGO, isVerified: false },
        }),
        this.ticketRepository.count({ where: { status: TicketStatus.OPEN } }),
        this.flagRepository.count({ where: { status: FlagStatus.FLAGGED } }),
        this.donationRepository.find({ order: { createdAt: 'DESC' }, take: 5 }),
      ]);

    const notifications = [];

    if (pendingNgos > 0) {
      notifications.push({
        id: 'pending-ngos',
        type: 'pending_ngo',
        title: `${pendingNgos} NGO(s) awaiting verification`,
        message: 'Review and approve pending NGO applications.',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    if (openTickets > 0) {
      notifications.push({
        id: 'open-tickets',
        type: 'support_ticket',
        title: `${openTickets} open support ticket(s)`,
        message: 'Users need help. Check the Support Tickets tab.',
        priority: 'medium',
        createdAt: new Date().toISOString(),
      });
    }

    if (flaggedCount > 0) {
      notifications.push({
        id: 'flagged-food',
        type: 'flagged_food',
        title: `${flaggedCount} flagged donation(s) need review`,
        message: 'Flagged food items are awaiting admin decision.',
        priority: 'high',
        createdAt: new Date().toISOString(),
      });
    }

    recentDonations.forEach((d) => {
      notifications.push({
        id: `donation-${d.id}`,
        type: 'new_donation',
        title: `New donation: ${d.name}`,
        message: `${d.quantity} ${d.unit} of ${d.foodType} posted.`,
        priority: 'low',
        createdAt: d.createdAt,
      });
    });

    return notifications;
  }
}
