import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
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
      password: hashedPassword, // Storing Hash
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

  async getProfile(userId: string) {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    // Remove password from response
    const { password, ...result } = user;
    return result;
  }

  async updateProfile(userId: string, updateData: any) {
    await this.usersRepository.update(userId, updateData);
    return this.getProfile(userId);
  }
}