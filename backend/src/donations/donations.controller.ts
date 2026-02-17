import { Controller, Get, Post, Patch, Param, Body, Query, UseInterceptors, UploadedFiles, UseGuards, Req } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DonationsService } from './donations.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { CreateDonationDto, ClaimDonationDto, UpdateDonationStatusDto } from './dto/donations.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CacheInterceptor, CacheTTL } from '@nestjs/cache-manager';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new food donation' })
  @ApiResponse({
    status: 201,
    description: 'Donation created successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Validation error'
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5)) // Allow up to 5 images
  async create(
    @Body() createDonationDto: CreateDonationDto,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    if (files && files.length > 0) {
      const imageUrls = await this.cloudinaryService.uploadImages(files);
      createDonationDto.imageUrls = imageUrls;
    }
    return this.donationsService.create(createDonationDto, req.user.userId);
  }

  @Get()
  @UseInterceptors(CacheInterceptor)
  @CacheTTL(60)
  @ApiOperation({ summary: 'Get all available food donations' })
  @ApiQuery({
    name: 'latitude',
    required: false,
    type: Number,
    description: 'NGO latitude for distance filtering'
  })
  @ApiQuery({
    name: 'longitude',
    required: false,
    type: Number,
    description: 'NGO longitude for distance filtering'
  })
  @ApiQuery({
    name: 'radius',
    required: false,
    type: Number,
    description: 'Search radius in km (default: 5)'
  })
  @ApiResponse({
    status: 200,
    description: 'List of available donations'
  })
  findAll(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius: number = 5,
  ) {
    return this.donationsService.findAll(latitude, longitude, radius);
  }

  @Patch(':id/claim')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Claim a food donation (NGO only)' })
  @ApiResponse({
    status: 200,
    description: 'Donation claimed successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Donation already claimed'
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found'
  })
  claim(
    @Param('id') id: string,
    @Body() claimDto: ClaimDonationDto,
    @Req() req: any,
  ) {
    return this.donationsService.claim(id, claimDto, req.user.userId);
  }

  @Patch(':id/status')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()

  @ApiOperation({ summary: 'Update food donation status' })
  @ApiResponse({
    status: 200,
    description: 'Donation status updated successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid status or unauthorized'
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found'
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateDonationStatusDto,
    @Req() req: any,
  ) {
    return this.donationsService.updateStatus(id, updateDto.status, req.user.userId);
  }

  @Patch(':id/deliver')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Mark a food donation as delivered' })
  @ApiResponse({
    status: 200,
    description: 'Donation marked as delivered successfully'
  })
  @ApiResponse({
    status: 400,
    description: 'Donation already delivered or mismatch'
  })
  @ApiResponse({
    status: 404,
    description: 'Donation not found'
  })
  markAsDelivered(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.donationsService.updateStatus(id, 'DELIVERED' as any, req.user.userId);
  }
}