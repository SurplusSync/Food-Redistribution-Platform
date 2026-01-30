import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS - Allow Frontend to connect
  app.enableCors({
    origin: 'http://localhost:5173', // Keshav's frontend URL
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

  // Setup Swagger Documentation
  const config = new DocumentBuilder()
    .setTitle('Food Redistribution API')
    .setDescription('API for connecting donors, NGOs, and volunteers')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
  console.log('🚀 Backend running on http://localhost:3000');
  console.log('📚 Swagger docs at http://localhost:3000/api');
}
bootstrap();