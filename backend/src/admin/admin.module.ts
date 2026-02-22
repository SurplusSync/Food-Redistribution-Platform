import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { User } from '../auth/entities/user.entity';
import { Donation } from '../donations/entities/donation.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Donation])],
  controllers: [AdminController],
})
export class AdminModule {}
