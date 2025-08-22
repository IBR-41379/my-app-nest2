import { Module } from '@nestjs/common';
import { ThrottlerModule } from '@nestjs/throttler';
import { AnnouncementsModule } from './announcements/announcements.module';
import { HealthModule } from './health/health.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'short',
        ttl: 60000, // 1 minute
        limit: 300, // 300 requests per minute per IP (more generous for dev)
      },
      {
        name: 'comments',
        ttl: 60000, // 1 minute  
        limit: 50, // 50 comments per minute per IP (more generous for dev)
      },
    ]),
    AnnouncementsModule,
    HealthModule,
  ],
})
export class AppModule {}
