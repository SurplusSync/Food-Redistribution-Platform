import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { DonationsModule } from './donations/donations.module';
import { AdminModule } from './admin/admin.module';
import { User } from './auth/entities/user.entity';
import { Donation } from './donations/entities/donation.entity';
import { CacheModule } from '@nestjs/cache-manager';
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

    CacheModule.registerAsync({
      isGlobal: true,
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('REDIS_URL');
        const redisHost = configService.get<string>('REDIS_HOST') || 'redis';
        const redisPort = parseInt(configService.get<string>('REDIS_PORT') || '6379', 10);
        const redisUsername = configService.get<string>('REDIS_USERNAME');
        const redisPassword = configService.get<string>('REDIS_PASSWORD');
        const redisTlsEnabled = (configService.get<string>('REDIS_TLS') || 'false') === 'true';

        const encodedUsername = redisUsername ? encodeURIComponent(redisUsername) : '';
        const encodedPassword = redisPassword ? encodeURIComponent(redisPassword) : '';
        const authSegment = encodedUsername || encodedPassword
          ? `${encodedUsername}:${encodedPassword}@`
          : '';

        const computedRedisUrl = redisUrl
          || `${redisTlsEnabled ? 'rediss' : 'redis'}://${authSegment}${redisHost}:${redisPort}`;

        return {
          stores: [createKeyvRedis(computedRedisUrl)],
          ttl: 30_000,
        };
      },
    }),

    // 2. Enable Cron Jobs
    ScheduleModule.forRoot(),

    // 3. Connect to Postgres (using variables from docker-compose)
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const dbSslEnabled = (configService.get<string>('DB_SSL') || 'false') === 'true';

        return {
          type: 'postgres' as const,
          host: configService.get<string>('DATABASE_HOST') || 'postgres',
          port: parseInt(configService.get<string>('DATABASE_PORT') || '5432', 10),
          username: configService.get<string>('POSTGRES_USER') || 'student',
          password: configService.get<string>('POSTGRES_PASSWORD') || 'student',
          database: configService.get<string>('POSTGRES_DB') || 'surplus_db',
          entities: [User, Donation],
          synchronize: true,
          ssl: dbSslEnabled ? { rejectUnauthorized: false } : false,
        };
      },
    }),

    AuthModule,
    DonationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
