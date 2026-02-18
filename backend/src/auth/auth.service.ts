import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
import { Donation, DonationStatus } from '../donations/entities/donation.entity'; // ✅ added DonationStatus

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Donation)
    private donationsRepository: Repository<Donation>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
      },
      message: 'User registered successfully',
    };
  }

  async login(loginDto: LoginDto) {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email }
    });

    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      role: user.role
    });

    return {
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
      },
      message: 'Login successful',
    };
  }

  // ✅ FIXED: handles donor, NGO and volunteer separately
  private async getImpactStats(userId: string, role: string) {
    if (role === 'VOLUNTEER') {
      const deliveries = await this.donationsRepository.find({
        where: { volunteerId: userId, status: DonationStatus.DELIVERED }
      });
      return {
        totalDonations: deliveries.length,
        mealsProvided: deliveries.length * 10,
        kgSaved: deliveries.length * 5,
      };
    }

    // DONOR and NGO
    const donations = await this.donationsRepository.find({
      where: { donorId: userId }
    });
    const totalDonations = donations.length;
    const delivered = donations.filter(d => d.status === DonationStatus.DELIVERED).length;
    return {
      totalDonations,
      mealsProvided: delivered * 10,
      kgSaved: delivered * 5,
    };
  }

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        statusCode: 404,
      });
    }

    const { password, ...userWithoutPassword } = user;
    const impactStats = await this.getImpactStats(userId, user.role); // ✅ pass role

    return {
      ...userWithoutPassword,
      karmaPoints: user.karmaPoints || 0,
      badges: user.badges || [],
      level: this.calculateLevel(user.karmaPoints || 0),
      nextLevelPoints: this.getNextLevelPoints(user.karmaPoints || 0),
      impactStats,
    };
  }

  async updateProfile(userId: string, updateData: any) {
    await this.usersRepository.update(userId, updateData);

    const user = await this.usersRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException({
        success: false,
        message: 'User not found',
        statusCode: 404,
      });
    }

    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        ...userWithoutPassword,
        karmaPoints: user.karmaPoints || 0,
        badges: user.badges || [],
        level: this.calculateLevel(user.karmaPoints || 0),
        nextLevelPoints: this.getNextLevelPoints(user.karmaPoints || 0),
      },
      message: 'Profile updated successfully',
    };
  }

  private calculateLevel(karmaPoints: number): number {
    if (karmaPoints < 100) return 1;
    if (karmaPoints < 250) return 2;
    if (karmaPoints < 500) return 3;
    if (karmaPoints < 1000) return 4;
    return 5;
  }

  private getNextLevelPoints(karmaPoints: number): number {
    if (karmaPoints < 100) return 100 - karmaPoints;
    if (karmaPoints < 250) return 250 - karmaPoints;
    if (karmaPoints < 500) return 500 - karmaPoints;
    if (karmaPoints < 1000) return 1000 - karmaPoints;
    return 0;
  }
}