// src/services/comments.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CreateCommentDto } from '../dto/create-comment.dto';
import { InMemoryAnnouncementsRepository } from '../repositories/in-memory-announcements.repository';

@Injectable()
export class CommentsService {
  constructor(
    private readonly announcementsRepository: InMemoryAnnouncementsRepository,
  ) {}

  async create(announcementId: string, createCommentDto: CreateCommentDto): Promise<CommentResponseDto> {
    const announcement = await this.announcementsRepository.findOne(announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }
    
    const comment = await this.announcementsRepository.createComment({
      announcementId,
      authorName: createCommentDto.authorName,
      text: createCommentDto.text,
    });
    
    return {
      id: comment.id,
      authorName: comment.authorName,
      text: comment.text,
      createdAt: comment.createdAt,
    };
  }

  async findAll(announcementId: string, cursor?: string, limit = 10): Promise<{
    comments: CommentResponseDto[];
    nextCursor: string | null;
  }> {
    const announcement = await this.announcementsRepository.findOne(announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }
    
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    
    let comments = await this.announcementsRepository.findCommentsByAnnouncementId(announcementId);
    
    // Apply cursor-based pagination
    if (cursor) {
      const cursorIndex = comments.findIndex(c => c.id === cursor);
      if (cursorIndex !== -1) {
        comments = comments.slice(cursorIndex + 1);
      }
    }
    
    // Get the requested number of comments
    const paginatedComments = comments.slice(0, limit);
    
    // Determine next cursor
    const nextCursor = comments.length > limit ? paginatedComments[paginatedComments.length - 1].id : null;
    
    return {
      comments: paginatedComments.map(comment => ({
        id: comment.id,
        authorName: comment.authorName,
        text: comment.text,
        createdAt: comment.createdAt,
      })),
      nextCursor,
    };
  }
}