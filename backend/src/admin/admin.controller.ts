import {
  Controller,
  Get,
  Patch,
  Param,
  UseGuards,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../auth/entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';

@UseGuards(JwtAuthGuard, RolesGuard) // 🛡️ LOCKED DOWN!
@Controller('admin')
export class AdminController {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationRepository: Repository<Donation>,
  ) {}

  // 1. Get all NGOs that are waiting for approval
  @Get('pending-ngos')
  async getPendingNgos() {
    return await this.userRepository.find({
      where: {
        role: UserRole.NGO,
        isVerified: false,
      },
      select: [
        'id',
        'name',
        'email',
        'organizationName',
        'phone',
        'address',
        'certificateUrl',
        'createdAt',
      ], // Don't send passwords!
    });
  }

  // 2. Approve/Verify an NGO
  @Patch('verify/:id')
  async verifyNgo(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isVerified = true;
    await this.userRepository.save(user);

    return {
      message: `${user.organizationName || user.name} has been successfully verified!`,
      user,
    };
  }

  // 3. Get ALL Users (For the main Admin User Table)
  @Get('users')
  async getAllUsers() {
    return await this.userRepository.find({
      select: [
        'id',
        'name',
        'email',
        'role',
        'organizationName',
        'isVerified',
        'isActive',
        'createdAt',
      ],
      order: { createdAt: 'DESC' },
    });
  }

  // 4. Suspend or Unsuspend a User (Moderation - Epic 7, US 2)
  @Patch('users/:id/toggle-status')
  async toggleUserStatus(@Param('id') id: string) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');

    // Prevent the Super Admin from accidentally banning themselves
    if (user.role === UserRole.ADMIN) {
      throw new Error('Cannot suspend an administrator account');
    }

    user.isActive = !user.isActive; // Flip true to false, or false to true
    await this.userRepository.save(user);

    return {
      message: `User ${user.name} has been ${user.isActive ? 'unbanned' : 'suspended'}.`,
      isActive: user.isActive,
    };
  }

  // 5. Get ALL Platform Donations (For the Admin Overview)
  @Get('donations')
  async getAllDonations() {
    return await this.donationRepository.find({
      relations: ['donor'], // Loads the donor details so admin sees who posted it
      order: { createdAt: 'DESC' },
    });
  }
}
