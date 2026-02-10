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
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
      username: process.env.DATABASE_USER,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User, Donation],
      synchronize: true,
    }),


    AuthModule,
    DonationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }