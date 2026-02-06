import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min, IsBoolean, ValidateNested, IsObject } from 'class-validator';
import { Type } from 'class-transformer';

class HygieneDto {
  @ApiProperty()
  @IsBoolean()
  keptCovered: boolean;

  @ApiProperty()
  @IsBoolean()
  containerClean: boolean;
}

export class CreateDonationDto {
  // --- NEW FIELDS (Required by Frontend) ---
  @ApiProperty({ example: 'Vegetable Biryani', description: 'Name of the food item' })
  @IsString()
  name: string;

  @ApiProperty({ example: 'donor-123', description: 'ID of the donor' })
  @IsString()
  donorId: string;

  @ApiProperty({ example: 'Green Restaurant', description: 'Name of the donor' })
  @IsString()
  donorName: string;

  @ApiProperty({ required: false, description: 'Food description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Hygiene checklist' })
  @IsOptional()
  // @ValidateNested() // Uncomment if you want strict validation
  // @Type(() => HygieneDto)
  hygiene?: any;

  @ApiProperty({ required: false, description: 'Donor trust score' })
  @IsOptional()
  donorTrustScore?: number;

  // --- EXISTING FIELDS ---
  @ApiProperty({ example: 'cooked', description: 'Type of food' })
  @IsString()
  foodType: string;

  @ApiProperty({ example: 50, description: 'Quantity' })
  @IsNumber()
  @Min(0.1)
  quantity: number;

  @ApiProperty({ example: 'kg', description: 'Unit' })
  @IsString()
  unit: string;

  @ApiProperty({ example: '2025-01-30T10:00:00Z', description: 'Preparation time' })
  @IsDateString()
  preparationTime: string;

  @ApiProperty({ example: 17.6868, description: 'Latitude' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 83.2185, description: 'Longitude' })
  @IsNumber()
  longitude: number;

  @ApiProperty({ required: false, description: 'Address' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false, description: 'Image URLs', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  imageUrls?: string[];
}

export class ClaimDonationDto {
  @ApiProperty({
    example: '2025-01-30T15:00:00Z',
    description: 'Estimated pickup time'
  })
  @IsDateString()
  estimatedPickupTime: string;
}