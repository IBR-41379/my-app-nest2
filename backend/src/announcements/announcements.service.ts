import { Injectable, NotFoundException } from '@nestjs/common';
import { Announcement, Status } from './announcement.entity';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';

@Injectable()
export class AnnouncementsService {
  private announcements: Announcement[] = [];

  create(dto: CreateAnnouncementDto): Announcement {
    const now = new Date().toISOString();
    const item: Announcement = {
      id: Date.now().toString(),
      title: dto.title,
      description: dto.description,
      status: 'active',
      createdAt: now,
    };
    this.announcements.push(item);
    return item;
  }

  findAll(): Announcement[] {
    return [...this.announcements].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
  }

  updateStatus(id: string, status: Status): Announcement {
    const idx = this.announcements.findIndex(a => a.id === id);
    if (idx === -1) throw new NotFoundException('Announcement not found');
    this.announcements[idx] = { ...this.announcements[idx], status };
    return this.announcements[idx];
  }
}
