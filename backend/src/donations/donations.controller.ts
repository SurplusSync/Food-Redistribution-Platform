import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFiles,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { DonationsService } from './donations.service';
import { CloudinaryService } from '../common/cloudinary.service';
import {
  CreateDonationDto,
  ClaimDonationDto,
  UpdateDonationStatusDto,
} from './dto/donations.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiConsumes,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

// ─── File upload validation ───────────────────────────────────────────────────
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB per file

function validateUploadedFiles(files: Express.Multer.File[]): void {
  for (const file of files) {
    // 1. Reject non-image MIME types (pdf, exe, php, etc.)
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `File "${file.originalname}" is not allowed. ` +
        `Only JPEG, PNG, WEBP, and GIF images are accepted. ` +
        `Received: ${file.mimetype}`,
      );
    }
    // 2. Reject files over 5 MB
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new BadRequestException(
        `File "${file.originalname}" exceeds the 5 MB size limit.`,
      );
    }
    // 3. Block double-extension attacks (e.g. malicious.php.jpg)
    const parts = file.originalname.split('.');
    if (parts.length > 2) {
      throw new BadRequestException(
        `File "${file.originalname}" has a suspicious double extension and was rejected.`,
      );
    }
  }
}

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  // ─── STATIC ROUTES FIRST (must come before any :id param routes) ─────────

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60_000)
  @ApiOperation({ summary: 'Get all available food donations' })
  @ApiQuery({ name: 'latitude', required: false, type: Number, description: 'NGO latitude for distance filtering' })
  @ApiQuery({ name: 'longitude', required: false, type: Number, description: 'NGO longitude for distance filtering' })
  @ApiQuery({ name: 'radius', required: false, type: Number, description: 'Search radius in km (default: 5)' })
  @ApiQuery({ name: 'status', required: false, type: String, description: 'Comma-separated statuses to filter (e.g. AVAILABLE,CLAIMED)' })
  @ApiResponse({ status: 200, description: 'List of available donations' })
  findAll(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius: number = 5,
    @Query('status') status?: string,
  ) {
    const statuses = status ? status.split(',').map((s) => s.trim().toUpperCase()) : undefined;
    return this.donationsService.findAll(latitude, longitude, radius, statuses);
  }

  @Get('stats/monthly')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get monthly donation stats for the authenticated user (NGO growth reports)' })
  @ApiResponse({ status: 200, description: 'Monthly stats retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getMonthlyStats(@Req() req: any) {
    return this.donationsService.getMonthlyStats(req.user.userId);
  }

  @Get('stats/community')
  @ApiOperation({ summary: 'Get platform-wide community impact stats (public)' })
  @ApiResponse({ status: 200, description: 'Community stats retrieved successfully' })
  async getCommunityStats() {
    return this.donationsService.getCommunityStats();
  }

  @Get('leaderboard')
  @ApiOperation({ summary: 'Get leaderboard rankings by karma points' })
  @ApiQuery({ name: 'scope', required: false, enum: ['weekly', 'monthly', 'all'], description: 'Time scope (default: all)' })
  @ApiQuery({ name: 'role', required: false, enum: ['DONOR', 'NGO', 'VOLUNTEER'], description: 'Filter by role' })
  @ApiResponse({ status: 200, description: 'Leaderboard retrieved successfully' })
  async getLeaderboard(@Query('scope') scope: string = 'all', @Query('role') role?: string) {
    return this.donationsService.getLeaderboard(scope, role);
  }

  @Get('my-deliveries')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get active deliveries assigned to the current volunteer' })
  @ApiResponse({ status: 200, description: 'Active deliveries for the volunteer' })
  async getMyDeliveries(@Req() req: any) {
    return this.donationsService.getVolunteerDeliveries(req.user.userId);
  }

  // ─── PARAMETERISED ROUTES ─────────────────────────────────────────────────

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new food donation' })
  @ApiResponse({ status: 201, description: 'Donation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error or invalid file type' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('images', 5, {
      storage: memoryStorage(),
      limits: { fileSize: MAX_FILE_SIZE_BYTES },
    }),
  )
  async create(
    @Body() createDonationDto: CreateDonationDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    if (files && files.length > 0) {
      validateUploadedFiles(files);
      const imageUrls = await this.cloudinaryService.uploadImages(files);
      createDonationDto.imageUrls = imageUrls;
    }
    return this.donationsService.create(createDonationDto, req.user.userId);
  }

  @Patch(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a food donation (NGO only)' })
  @ApiResponse({ status: 200, description: 'Donation claimed successfully' })
  @ApiResponse({ status: 400, description: 'Donation already claimed' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  claim(@Param('id') id: string, @Body() claimDto: ClaimDonationDto, @Req() req: any) {
    return this.donationsService.claim(id, claimDto, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update food donation status' })
  @ApiResponse({ status: 200, description: 'Donation status updated successfully' })
  @ApiResponse({ status: 400, description: 'Invalid status or unauthorized' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  updateStatus(@Param('id') id: string, @Body() updateDto: UpdateDonationStatusDto, @Req() req: any) {
    return this.donationsService.updateStatus(id, updateDto.status, req.user.userId);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a food donation as delivered' })
  @ApiResponse({ status: 200, description: 'Donation marked as delivered successfully' })
  @ApiResponse({ status: 400, description: 'Donation already delivered or mismatch' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  markAsDelivered(@Param('id') id: string, @Req() req: any) {
    return this.donationsService.updateStatus(id, 'DELIVERED' as any, req.user.userId);
  }
}