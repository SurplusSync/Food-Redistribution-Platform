import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  Get,
  Param,
  ForbiddenException,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto/create-feedback.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UserRole } from '../auth/entities/user.entity';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Feedback')
@Controller('feedback')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FeedbackController {
  constructor(private readonly feedbackService: FeedbackService) {}

  @Post()
  @ApiOperation({
    summary: 'Submit feedback for a delivered donation (NGO only)',
  })
  @ApiResponse({
    status: 201,
    description: 'Feedback submitted successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error or invalid donation status',
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found',
  })
  async createFeedback(
    @Req() req: any,
    @Body() createFeedbackDto: CreateFeedbackDto,
  ) {
    if (req.user.role !== UserRole.NGO) {
      throw new ForbiddenException('Only NGOs can submit feedback');
    }
    // Expecting req.user.userId from JwtAuthGuard
    const ngoId = req.user.userId || req.user.id;
    return await this.feedbackService.createFeedback(ngoId, createFeedbackDto);
  }

  @Get('donation/:donationId')
  @ApiOperation({ summary: 'Get feedback given for a specific donation' })
  @ApiResponse({
    status: 200,
    description: 'Feedback retrieved successfully',
  })
  async getFeedbackForDonation(@Param('donationId') donationId: string) {
    return await this.feedbackService.getFeedbackForDonation(donationId);
  }

  @Get('donor/:donorId/average')
  @ApiOperation({ summary: 'Get the average feedback rating for a donor' })
  @ApiResponse({
    status: 200,
    description:
      'Returns the average score and total number of reviews for the donor',
  })
  async getAverageRatingForDonor(@Param('donorId') donorId: string) {
    return await this.feedbackService.getAverageRatingForDonor(donorId);
  }
}
