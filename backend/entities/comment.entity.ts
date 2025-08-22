// src/entities/comment.entity.ts
export class Comment {
  id: string;
  announcementId: string;
  authorName: string;
  text: string;
  createdAt: Date;

  constructor(partial: Partial<Comment>) {
    Object.assign(this, partial);
    if (!this.id) this.id = Math.random().toString(36).substring(2);
    if (!this.createdAt) this.createdAt = new Date();
  }
}