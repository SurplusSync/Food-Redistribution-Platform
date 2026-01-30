import { Controller, Get, Post, Patch, Param, Body, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { DonationsService } from './donations.service';
import { CreateDonationDto, ClaimDonationDto } from './dto/donations.dto';

@ApiTags('Donations')
@Controller('donations')
export class DonationsController {
  constructor(private readonly donationsService: DonationsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new food donation' })
  @ApiResponse({ 
    status: 201, 
    description: 'Donation created successfully' 
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Validation error' 
  })
  create(@Body() createDonationDto: CreateDonationDto) {
    return this.donationsService.create(createDonationDto);
  }

  @Get()
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
  ) {
    return this.donationsService.claim(id, claimDto);
  }
}