import { Module } from '@nestjs/common';
import { AnnouncementsModule } from './announcements/announcements.module';

@Module({
  imports: [AnnouncementsModule],
})
export class AppModule {}
