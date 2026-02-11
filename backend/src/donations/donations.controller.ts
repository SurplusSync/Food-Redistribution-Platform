import { Controller, Get, Post, Patch, Param, Body, Query, UseInterceptors, UploadedFiles, UseGuards, Req, ForbiddenException, BadRequestException } from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DonationsService } from './donations.service';
import { CloudinaryService } from '../common/cloudinary.service';
import { CreateDonationDto, ClaimDonationDto, UpdateDonationStatusDto, UpdateDonationDto } from './dto/donations.dto';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiConsumes, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '../auth/entities/user.entity';

@ApiTags('Donations')
@Controller('donations')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth()
export class DonationsController {
  constructor(
    private readonly donationsService: DonationsService,
    private readonly cloudinaryService: CloudinaryService,
  ) { }

  @Post()
  @Roles(UserRole.DONOR, UserRole.ADMIN)
  @ApiOperation({ summary: 'Create a new food donation' })
  @ApiResponse({ status: 201, description: 'Donation created successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('images', 5))
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
  @ApiOperation({ summary: 'Get all available food donations' })
  @ApiQuery({ name: 'latitude', required: false, type: Number })
  @ApiQuery({ name: 'longitude', required: false, type: Number })
  @ApiQuery({ name: 'radius', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'List of available donations' })
  findAll(
    @Query('latitude') latitude?: number,
    @Query('longitude') longitude?: number,
    @Query('radius') radius: number = 5,
  ) {
    return this.donationsService.findAll(latitude, longitude, radius);
  }

  @Patch(':id/claim')
  @Roles(UserRole.NGO)
  @ApiOperation({ summary: 'Claim a food donation (NGO only)' })
  @ApiResponse({ status: 200, description: 'Donation claimed successfully' })
  @ApiResponse({ status: 400, description: 'Donation already claimed' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  claim(
    @Param('id') id: string,
    @Body() claimDto: ClaimDonationDto,
    @Req() req: any,
  ) {
    return this.donationsService.claim(id, claimDto, req.user.userId);
  }


  @Patch(':id/pickup')
  @Roles(UserRole.VOLUNTEER)
  @ApiOperation({ summary: 'Confirm food donation pickup (Volunteer only)' })
  @ApiResponse({ status: 200, description: 'Donation picked up successfully' })
  @ApiResponse({ status: 400, description: 'Invalid state or unauthorized' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  pickup(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.donationsService.pickup(id, req.user.userId);
  }

  @Patch(':id/deliver')
  @Roles(UserRole.VOLUNTEER)
  @ApiOperation({ summary: 'Confirm food donation delivery (Volunteer only)' })
  @ApiResponse({ status: 200, description: 'Donation delivered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid state or unauthorized' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  deliver(
    @Param('id') id: string,
    @Req() req: any,
  ) {
    return this.donationsService.deliver(id, req.user.userId);
  }

  @Post(':id/image')
  @Roles(UserRole.DONOR)
  @ApiOperation({ summary: 'Upload an image for a food donation (Donor only)' })
  @ApiResponse({ status: 201, description: 'Image uploaded successfully' })
  @ApiResponse({ status: 403, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('image', 1))
  async uploadImage(
    @Param('id') id: string,
    @UploadedFiles() files: Array<Express.Multer.File>,
    @Req() req: any,
  ) {
    if (!files || files.length === 0) {
      throw new BadRequestException('No image file provided');
    }
    const imageUrls = await this.cloudinaryService.uploadImages(files);
    return this.donationsService.updateImage(id, imageUrls[0], req.user.userId);
  }

  @Patch(':id')
  @Roles(UserRole.DONOR)
  @ApiOperation({ summary: 'Update food donation details (Donor only)' })
  @ApiResponse({ status: 200, description: 'Donation updated successfully' })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  @ApiResponse({ status: 404, description: 'Donation not found' })
  update(
    @Param('id') id: string,
    @Body() updateDto: UpdateDonationDto,
    @Req() req: any,
  ) {
    return this.donationsService.update(id, updateDto, req.user.userId);
  }

  @Patch(':id/status')
  @Roles(UserRole.ADMIN) // Restrict general status updates to ADMIN at controller level
  @ApiOperation({ summary: 'Update food donation status (Admin only)' })
  @ApiResponse({ status: 200, description: 'Donation status updated successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden' })
  updateStatus(
    @Param('id') id: string,
    @Body() updateDto: UpdateDonationStatusDto,
    @Req() req: any,
  ) {
    return this.donationsService.updateStatus(id, updateDto.status, req.user.userId);
  }
}