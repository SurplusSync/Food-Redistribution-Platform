import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';
import { UserRole } from '../../../../shared/types/user.types';

export class RegisterDto {
  @ApiProperty({ 
    example: 'donor@restaurant.com', 
    description: 'User email address' 
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123', 
    description: 'Password (minimum 6 characters)' 
  })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ 
    example: 'Annapurna Restaurant', 
    description: 'Full name or business name' 
  })
  @IsString()
  name: string;

  @ApiProperty({ 
    enum: UserRole, 
    example: UserRole.DONOR, 
    description: 'User role in the platform' 
  })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ 
    required: false, 
    example: '+919876543210', 
    description: 'Contact phone number' 
  })
  @IsOptional()
  @IsString()
  phone?: string; // Renamed from phoneNumber to match Frontend

  @ApiProperty({ 
    required: false, 
    example: 'Green Foods Ltd', 
    description: 'Name of the business or NGO' 
  })
  @IsOptional()
  @IsString()
  organizationName?: string;

  @ApiProperty({ 
    required: false, 
    example: 'Restaurant', 
    description: 'Type of organization' 
  })
  @IsOptional()
  @IsString()
  organizationType?: string;

  @ApiProperty({ 
    required: false, 
    example: '123 Main St, Delhi', 
    description: 'Physical address' 
  })
  @IsOptional()
  @IsString()
  address?: string;
}

export class LoginDto {
  @ApiProperty({ 
    example: 'donor@restaurant.com',
    description: 'User email address'
  })
  @IsEmail()
  email: string;

  @ApiProperty({ 
    example: 'password123',
    description: 'User password'
  })
  @IsString()
  password: string;
}