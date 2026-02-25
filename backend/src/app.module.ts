import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';
import { AdminModule } from './admin/admin.module';
import { User } from './auth/entities/user.entity';
import { Donation } from './donations/entities/donation.entity';
import { CacheModule } from '@nestjs/cache-manager';
import { ScheduleModule } from '@nestjs/schedule';
import { createKeyv as createKeyvRedis } from '@keyv/redis';

@Module({
  imports: [
    CacheModule.register({
      isGlobal: true,        // Makes caching available everywhere
      stores: [
        createKeyvRedis(`redis://${process.env.REDIS_HOST || 'redis'}:${parseInt(process.env.REDIS_PORT, 10) || 6379}`),
      ],
      ttl: 30_000,           // Default cache life: 30 seconds (milliseconds)
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

    // Admin dashboard module
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}