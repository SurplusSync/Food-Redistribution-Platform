import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { SupportTicket, TicketPriority } from './entities/support-ticket.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { EmailService } from '../common/email.service';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';

@ApiTags('Support Tickets')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('support/tickets')
export class SupportTicketsController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(SupportTicket)
    private ticketRepository: Repository<SupportTicket>,
    private emailService: EmailService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Get tickets belonging to the current user' })
  async getMyTickets(@Req() req: any) {
    return await this.ticketRepository.find({
      where: { userId: req.user.userId },
      order: { createdAt: 'DESC' },
    });
  }

  @Post()
  @ApiOperation({ summary: 'Create a support ticket' })
  async createTicket(
    @Req() req: any,
    @Body() body: { subject: string; description: string; priority?: TicketPriority },
  ) {
    const user = await this.userRepository.findOne({ where: { id: req.user.userId } });
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

    this.emailService.sendSupportTicketAck(user.email, user.name, body.subject, saved.id);

    return saved;
  }
}
