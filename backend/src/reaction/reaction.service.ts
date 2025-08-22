// src/services/reactions.service.ts
import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { ReactionType } from '../entities/reaction.entity';
import { InMemoryAnnouncementsRepository } from '../repositories/in-memory-announcements.repository';

@Injectable()
export class ReactionsService {
  constructor(
    private readonly announcementsRepository: InMemoryAnnouncementsRepository,
  ) {}

  async create(
    announcementId: string,
    userId: string,
    type: ReactionType,
    idempotencyKey?: string,
  ): Promise<{ type: ReactionType }> {
    const announcement = await this.announcementsRepository.findOne(announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }
    
    // Check idempotency key
    if (idempotencyKey) {
      const existingKey = await this.announcementsRepository.getIdempotencyKey(idempotencyKey);
      if (existingKey) {
        // Return the existing reaction without creating a new one
        return { type };
      }
    }
    
    // Check if user already has a reaction
    const existingReaction = await this.announcementsRepository.findReactionByUser(announcementId, userId);
    
    if (existingReaction) {
      if (existingReaction.type === type) {
        // Same reaction type, return without changes
        return { type };
      } else {
        // Different reaction type, update the existing reaction
        // For simplicity, we'll remove the old one and create a new one
        await this.announcementsRepository.removeReaction(announcementId, userId);
      }
    }
    
    // Create new reaction
    const reaction = await this.announcementsRepository.createReaction({
      announcementId,
      userId,
      type,
    });
    
    // Store idempotency key if provided
    if (idempotencyKey) {
      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + 5); // 5 minutes expiration
      
      await this.announcementsRepository.setIdempotencyKey(idempotencyKey, {
        reactionId: reaction.id,
        expiresAt,
      });
    }
    
    return { type };
  }

  async remove(announcementId: string, userId: string): Promise<void> {
    const announcement = await this.announcementsRepository.findOne(announcementId);
    if (!announcement) {
      throw new NotFoundException(`Announcement with ID ${announcementId} not found`);
    }

    const existingReaction = await this.announcementsRepository.findReactionByUser(announcementId, userId);
    if (!existingReaction) {
      throw new NotFoundException(`No reaction found for user ${userId} on announcement ${announcementId}`);
    }
    
    await this.announcementsRepository.removeReaction(announcementId, userId);
  }
}