import { Injectable, UnauthorizedException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { RegisterDto, LoginDto } from './dto/auth.dto';
import { User } from './entities/user.entity';
// import * as bcrypt from 'bcrypt'; // Uncomment if installed bcrypt

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    // 1. Check if user exists in the Real Database
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: registerDto.email } 
    });

    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // 2. Create User (For Sprint 1 MVP, we will skip hashing if bcrypt isn't installed)
    const user = this.usersRepository.create({
      ...registerDto,
      password: registerDto.password, // TODO: Add bcrypt.hash() here
    });
    
    // 3. Save to Postgres
    await this.usersRepository.save(user);

    // 4. Generate Real JWT Token
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
    // 1. Find User in Postgres
    const user = await this.usersRepository.findOne({ 
      where: { email: loginDto.email } 
    });

    // 2. Validate Password
    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException('Invalid email or password');
    }

    // 3. Generate Real JWT Token
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
}