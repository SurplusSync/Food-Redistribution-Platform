import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) { }

  async register(registerDto: RegisterDto) {
    // 1. Check if user exists
    const existingUser = await this.usersRepository.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Hash the password (Salt rounds: 10)
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // 3. Create User with Hashed Password
    const user = this.usersRepository.create({
      ...registerDto,
      password: hashedPassword,
    });

    await this.usersRepository.save(user);

    // 4. Generate Token
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
    // 1. Find User
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email }
    });

    // 2. Compare candidate password with stored Hash
    if (!user || !(await bcrypt.compare(loginDto.password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate Token
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

  // ✅ SINGLE getProfile method with karma and level
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

    return {
      success: true,
      data: {
        ...userWithoutPassword,
        karmaPoints: user.karmaPoints || 0,
        badges: user.badges || [],
        level: this.calculateLevel(user.karmaPoints || 0),
        nextLevelPoints: this.getNextLevelPoints(user.karmaPoints || 0),
      },
      message: 'Profile retrieved successfully',
    };
  }

  async updateProfile(userId: string, updateData: any) {
    await this.usersRepository.update(userId, updateData);

    // Fetch updated user
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

    // Return user without password
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

  // ✅ Calculate user level based on karma
  private calculateLevel(karmaPoints: number): number {
    if (karmaPoints < 100) return 1;
    if (karmaPoints < 250) return 2;
    if (karmaPoints < 500) return 3;
    if (karmaPoints < 1000) return 4;
    return 5;
  }

  // ✅ Get points needed for next level
  private getNextLevelPoints(karmaPoints: number): number {
    if (karmaPoints < 100) return 100 - karmaPoints;
    if (karmaPoints < 250) return 250 - karmaPoints;
    if (karmaPoints < 500) return 500 - karmaPoints;
    if (karmaPoints < 1000) return 1000 - karmaPoints;
    return 0; // Max level reached
  }
}