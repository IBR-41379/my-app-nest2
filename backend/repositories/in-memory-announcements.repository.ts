// src/repositories/in-memory-announcements.repository.ts
import { Injectable } from '@nestjs/common';
import { Announcement } from '../entities/announcement.entity';
import { Comment } from '../entities/comment.entity';
import { Reaction, ReactionType } from '../entities/reaction.entity';
import { AnnouncementsRepository } from './announcement.repository';


@Injectable()
export class InMemoryAnnouncementsRepository implements AnnouncementsRepository {
  private announcements: Announcement[] = [
    new Announcement({
      id: '1',
      title: 'Welcome to GoBasera',
      content: 'We are excited to have you here!',
      authorId: 'admin',
    }),
    new Announcement({
      id: '2',
      title: 'Community Meeting',
      content: 'Join us this Friday for our monthly community meeting.',
      authorId: 'admin',
    }),
  ];

  private comments: Comment[] = [];
  private reactions: Reaction[] = [];
  private idempotencyKeys: Map<string, { reactionId: string; expiresAt: Date }> = new Map();

  // Announcements
  async findAll(): Promise<Announcement[]> {
    return this.announcements;
  }

  async findOne(id: string): Promise<Announcement | null> {
    return this.announcements.find(a => a.id === id) || null;
  }

  // Comments
  async findCommentsByAnnouncementId(announcementId: string): Promise<Comment[]> {
    return this.comments
      .filter(c => c.announcementId === announcementId)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
  }

  async createComment(comment: Partial<Comment>): Promise<Comment> {
    const newComment = new Comment(comment);
    this.comments.push(newComment);
    return newComment;
  }

  async getCommentsCount(announcementId: string): Promise<number> {
    return this.comments.filter(c => c.announcementId === announcementId).length;
  }

  // Reactions
  async findReactionsByAnnouncementId(announcementId: string): Promise<Reaction[]> {
    return this.reactions.filter(r => r.announcementId === announcementId);
  }

  async findReactionByUser(announcementId: string, userId: string): Promise<Reaction | null> {
    return this.reactions.find(r => r.announcementId === announcementId && r.userId === userId) || null;
  }

  async createReaction(reaction: Partial<Reaction>): Promise<Reaction> {
    const newReaction = new Reaction(reaction);
    this.reactions.push(newReaction);
    return newReaction;
  }

  async removeReaction(announcementId: string, userId: string): Promise<void> {
    const index = this.reactions.findIndex(r => r.announcementId === announcementId && r.userId === userId);
    if (index !== -1) {
      this.reactions.splice(index, 1);
    }
  }

  // Idempotency
  async getIdempotencyKey(key: string): Promise<{ reactionId: string; expiresAt: Date } | null> {
    const value = this.idempotencyKeys.get(key);
    if (!value) return null;
    
    // Check if expired
    if (value.expiresAt < new Date()) {
      this.idempotencyKeys.delete(key);
      return null;
    }
    
    return value;
  }

  async setIdempotencyKey(key: string, value: { reactionId: string; expiresAt: Date }): Promise<void> {
    this.idempotencyKeys.set(key, value);
    
    // Clean up expired keys periodically (simplified for this example)
    setTimeout(() => {
      for (const [k, v] of this.idempotencyKeys.entries()) {
        if (v.expiresAt < new Date()) {
          this.idempotencyKeys.delete(k);
        }
      }
    }, 60000); // Run every minute
  }
}