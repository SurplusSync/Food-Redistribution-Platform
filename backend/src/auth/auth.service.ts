import { Injectable, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { RegisterDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private users: any[] = [];

  register(registerDto: RegisterDto) {
    // Check if user already exists
    const existingUser = this.users.find(u => u.email === registerDto.email);
    
    if (existingUser) {
      throw new BadRequestException({
        success: false,
        message: 'Email already exists',
        statusCode: 400,
      });
    }

    // Create new user
    const user = {
      id: Date.now().toString(),
      email: registerDto.email,
      name: registerDto.name,
      role: registerDto.role,
      phoneNumber: registerDto.phoneNumber,
      isVerified: false,
      createdAt: new Date(),
    };

    this.users.push({ ...user, password: registerDto.password });

    // Return without password
    const { password, ...userWithoutPassword } = user as any;

    return {
      success: true,
      data: {
        token: 'mock-jwt-token-' + user.id,
        user: userWithoutPassword,
      },
      message: 'User registered successfully',
    };
  }

  login(loginDto: LoginDto) {
    // Find user
    const user = this.users.find(u => u.email === loginDto.email);

    if (!user || user.password !== loginDto.password) {
      throw new UnauthorizedException({
        success: false,
        message: 'Invalid email or password',
        statusCode: 401,
      });
    }

    // Return without password
    const { password, ...userWithoutPassword } = user;

    return {
      success: true,
      data: {
        token: 'mock-jwt-token-' + user.id,
        user: userWithoutPassword,
      },
      message: 'Login successful',
    };
  }
}