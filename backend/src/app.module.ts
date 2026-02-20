import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';
import { User } from './auth/entities/user.entity';
import { Donation } from './donations/entities/donation.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,        // Makes caching available everywhere
      store: redisStore,     // Tells NestJS to use Redis, not RAM
      host: process.env.REDIS_HOST || 'redis',   // From docker-compose env
      port: parseInt(process.env.REDIS_PORT, 10) || 6379,
      ttl: 30,               // Default cache life: 30 seconds
    }),
    // 1. Load .env variables
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Enable Cron Jobs
    ScheduleModule.forRoot(),

    // 3. Connect to Postgres (using variables from docker-compose)
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'postgres',
      port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
      username: process.env.POSTGRES_USER || 'student',
      password: process.env.POSTGRES_PASSWORD || 'student',
      database: process.env.POSTGRES_DB || 'surplus_db',
      entities: [User, Donation], // This creates the tables automatically
      synchronize: true, // Auto-create tables (True for Dev, False for Prod)
    }),

    AuthModule,
    DonationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}