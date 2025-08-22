import { Module } from '@nestjs/common';
import { AnnouncementsController } from './announcements.controller';
import { AnnouncementsService } from './announcements.services';
import { CommentsController } from '../comments/comment.controller';
import { CommentsService } from '../comments/comment.services';
import { ReactionsController } from '../reaction/reaction.controller';
import { ReactionsService } from '../reaction/reaction.service';
import { InMemoryAnnouncementsRepository } from '../repositories/in-memory-announcements.repository';

@Module({
  controllers: [AnnouncementsController, CommentsController, ReactionsController],
  providers: [
    AnnouncementsService,
    CommentsService, 
    ReactionsService,
    InMemoryAnnouncementsRepository,
  ],
})
export class AnnouncementsModule {}
