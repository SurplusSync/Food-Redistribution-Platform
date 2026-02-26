import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User, UserRole } from './auth/entities/user.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow Frontend to connect
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173', // Keshav's frontend URL
    credentials: true,
  });

  // Enable automatic validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // --- SUPER ADMIN SEEDER START ---
  const userRepository = app.get(getRepositoryToken(User));
  const adminEmail = process.env.SUPER_ADMIN_EMAIL || 'admin@surplussync.com';

  const existingAdmin = await userRepository.findOne({ where: { role: UserRole.ADMIN } });

  if (!existingAdmin) {
    console.log('🌱 Seeding Super Admin account...');
    const hashedPassword = await bcrypt.hash(process.env.SUPER_ADMIN_PASSWORD || 'SecureAdmin123!', 10);

    await userRepository.save({
      name: 'System Admin',
      email: adminEmail,
      password: hashedPassword,
      phone: '0000000000',
      role: UserRole.ADMIN,
      isVerified: true,
    });
    console.log('✅ Super Admin seeded successfully!');
  }
  // --- SUPER ADMIN SEEDER END ---

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Food Redistribution API')
    .setDescription('API for connecting donors, NGOs, and volunteers')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = Number(process.env.PORT) || 3000;
  await app.listen(port);
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📚 Swagger docs at http://localhost:${port}/api`);
}
bootstrap();