// src/entities/reaction.entity.ts
export type ReactionType = 'up' | 'down' | 'heart';

export class Reaction {
  id: string;
  announcementId: string;
  userId: string;
  type: ReactionType;
  createdAt: Date;

  constructor(partial: Partial<Reaction>) {
    Object.assign(this, partial);
    if (!this.id) this.id = Math.random().toString(36).substring(2);
    if (!this.createdAt) this.createdAt = new Date();
  }
}