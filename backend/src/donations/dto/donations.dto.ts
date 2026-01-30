import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({ 
    example: 'Vegetable Biryani', 
    description: 'Type or name of food' 
  })
  @IsString()
  foodType: string;

  @ApiProperty({ 
    example: 50, 
    description: 'Quantity of food available' 
  })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ 
    example: 'servings', 
    description: 'Unit of measurement (servings, kg, plates, etc.)' 
  })
  @IsString()
  unit: string;

  @ApiProperty({ 
    example: '2025-01-30T10:00:00Z', 
    description: 'When the food was prepared (ISO 8601 format)' 
  })
  @IsDateString()
  preparationTime: string;

  @ApiProperty({ 
    example: 17.6868, 
    description: 'Latitude coordinate of food location' 
  })
  @IsNumber()
  latitude: number;

  @ApiProperty({ 
    example: 83.2185, 
    description: 'Longitude coordinate of food location' 
  })
  @IsNumber()
  longitude: number;

  @ApiProperty({ 
    required: false, 
    example: 'Beach Road, Visakhapatnam, Andhra Pradesh',
    description: 'Full address of pickup location'
  })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ 
    required: false,
    example: 'https://example.com/food-image.jpg',
    description: 'URL to image of the food'
  })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ 
    required: false,
    example: 'Keep refrigerated. Contains nuts.',
    description: 'Special handling or allergen information'
  })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class ClaimDonationDto {
  @ApiProperty({ 
    example: '2025-01-30T15:00:00Z',
    description: 'Estimated time when NGO will pick up the food (ISO 8601 format)'
  })
  @IsDateString()
  estimatedPickupTime: string;
}