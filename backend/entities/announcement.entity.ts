// src/entities/announcement.entity.ts
export class Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
  authorId: string;

  constructor(partial: Partial<Announcement>) {
    Object.assign(this, partial);
    if (!this.id) this.id = Math.random().toString(36).substring(2);
    if (!this.createdAt) this.createdAt = new Date();
    if (!this.updatedAt) this.updatedAt = new Date();
  }
}