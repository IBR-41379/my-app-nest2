// src/repositories/announcements.repository.ts
import { Announcement } from '../entities/announcement.entity';
import { Comment } from '../entities/comment.entity';
import { Reaction, ReactionType } from '../entities/reaction.entity';

export interface AnnouncementsRepository {
  // Announcements
  findAll(): Promise<Announcement[]>;
  findOne(id: string): Promise<Announcement | null>;
  
  // Comments
  findCommentsByAnnouncementId(announcementId: string): Promise<Comment[]>;
  createComment(comment: Partial<Comment>): Promise<Comment>;
  getCommentsCount(announcementId: string): Promise<number>;
  
  // Reactions
  findReactionsByAnnouncementId(announcementId: string): Promise<Reaction[]>;
  findReactionByUser(announcementId: string, userId: string): Promise<Reaction | null>;
  createReaction(reaction: Partial<Reaction>): Promise<Reaction>;
  removeReaction(announcementId: string, userId: string): Promise<void>;
  
  // Idempotency
  getIdempotencyKey(key: string): Promise<{ reactionId: string; expiresAt: Date } | null>;
  setIdempotencyKey(key: string, value: { reactionId: string; expiresAt: Date }): Promise<void>;
}