import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import helmet from 'helmet';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { ThrottlerGuard } from '@nestjs/throttler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Security
  app.use(helmet());
  app.use('/api', (req, res, next) => {
    if (req.headers['content-length'] && parseInt(req.headers['content-length']) > 10 * 1024 * 1024) {
      return res.status(413).json({ code: 'PAYLOAD_TOO_LARGE', message: 'Request too large' });
    }
    next();
  });

  // CORS
  app.enableCors({
    origin: [
      'http://localhost:5173',                 // local dev
      'https://frontend-pcm0.onrender.com',    // your actual frontend Render URL
    ],
    methods: ['GET', 'POST', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'If-None-Match', 'Idempotency-Key', 'x-user-id'],
    exposedHeaders: ['ETag'],
    credentials: false,
  });

  // Global pipes and filters
  app.useGlobalPipes(new ValidationPipe({ 
    whitelist: true, 
    forbidNonWhitelisted: true,
    transform: true,
    transformOptions: { enableImplicitConversion: true }
  }));
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global throttler guard (only in production)
  if (process.env.NODE_ENV === 'production') {
    const throttlerGuard = app.get(ThrottlerGuard);
    app.useGlobalGuards(throttlerGuard);
  }

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Announcements API')
    .setDescription('Resident engagement platform with comments and reactions')
    .setVersion('2.0')
    .addTag('announcements')
    .addTag('comments')
    .addTag('reactions')
    .addTag('health')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`API ready on http://localhost:${port}`);
  console.log(`Swagger docs at http://localhost:${port}/docs`);
}
bootstrap();
