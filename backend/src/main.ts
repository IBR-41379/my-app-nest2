import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.enableCors({
     origin: [
    'http://localhost:5173',                 // local dev
    'https://frontend-pcm0.onrender.com',    // your actual frontend Render URL
  ],
    methods: ['GET', 'POST', 'PATCH'],
    allowedHeaders: ['Content-Type'],
    credentials: false,
  });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));

  await app.listen(4000);
  console.log('API ready on http://localhost:4000');
}
bootstrap();
