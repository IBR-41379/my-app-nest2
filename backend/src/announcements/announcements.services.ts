// src/services/announcements.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { ReactionType } from '../entities/reaction.entity';
import { AnnouncementResponseDto } from 'src/dto/announcement-response.dto';
import type { AnnouncementsRepository } from 'src/repositories/announcement.repository';

@Injectable()
export class AnnouncementsService {
  constructor(
    private readonly announcementsRepository: AnnouncementsRepository,
  ) {}

  async findAll(): Promise<AnnouncementResponseDto[]> {
    const announcements = await this.announcementsRepository.findAll();
    
    const announcementDtos: AnnouncementResponseDto[] = [];
    
    for (const announcement of announcements) {
      const comments = await this.announcementsRepository.findCommentsByAnnouncementId(announcement.id);
      const reactions = await this.announcementsRepository.findReactionsByAnnouncementId(announcement.id);
      
      const reactionCounts = reactions.reduce((acc, reaction) => {
        acc[reaction.type] = (acc[reaction.type] || 0) + 1;
        return acc;
      }, {} as Record<ReactionType, number>);
      
      const lastComment = comments.length > 0 
        ? comments[comments.length - 1] 
        : null;
      
      announcementDtos.push({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        commentCount: comments.length,
        reactions: {
          up: reactionCounts.up || 0,
          down: reactionCounts.down || 0,
          heart: reactionCounts.heart || 0,
        },
        lastActivityAt: lastComment?.createdAt || announcement.createdAt,
        createdAt: announcement.createdAt,
      });
    }
    
    return announcementDtos;
  }

  async findOne(id: string): Promise<AnnouncementResponseDto> {
    const announcement = await this.announcementsRepository.findOne(id);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${id} not found`);
    }
    
    const comments = await this.announcementsRepository.findCommentsByAnnouncementId(id);
    const reactions = await this.announcementsRepository.findReactionsByAnnouncementId(id);
    
    const reactionCounts = reactions.reduce((acc, reaction) => {
      acc[reaction.type] = (acc[reaction.type] || 0) + 1;
      return acc;
    }, {} as Record<ReactionType, number>);
    
    const lastComment = comments.length > 0 
      ? comments[comments.length - 1] 
      : null;
    
    return {
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      commentCount: comments.length,
      reactions: {
        up: reactionCounts.up || 0,
        down: reactionCounts.down || 0,
        heart: reactionCounts.heart || 0,
      },
      lastActivityAt: lastComment?.createdAt || announcement.createdAt,
      createdAt: announcement.createdAt,
    };
  }
}