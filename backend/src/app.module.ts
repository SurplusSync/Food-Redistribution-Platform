import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';
import { User } from './auth/entities/user.entity';
import { Donation } from './donations/entities/donation.entity';

@Module({
  imports: [
    // 1. Load .env variables
    ConfigModule.forRoot({ isGlobal: true }),

    // 2. Connect to Postgres (using variables from docker-compose)
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