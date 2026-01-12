import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsDateString, IsOptional, Min } from 'class-validator';

export class CreateDonationDto {
  @ApiProperty({ example: 'Vegetable Biryani' })
  @IsString()
  foodType: string;

  @ApiProperty({ example: 50 })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'servings' })
  @IsString()
  unit: string;

  @ApiProperty({ example: '2025-01-12T10:00:00Z' })
  @IsDateString()
  preparationTime: string;

  @ApiProperty({ example: 17.6868 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 83.2185 })
  @IsNumber()
  longitude: number;

  @ApiProperty({ required: false, example: 'Beach Road, Visakhapatnam' })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  imageUrl?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}