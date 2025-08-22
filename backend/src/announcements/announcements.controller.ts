import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { AnnouncementsService } from './announcements.service';
import { CreateAnnouncementDto } from './dto/create-announcement.dto';
import { UpdateAnnouncementStatusDto } from './dto/update-announcement-status.dto';
import type { Announcement } from './announcement.entity';

@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly svc: AnnouncementsService) {}

  @Post()
  create(@Body() dto: CreateAnnouncementDto): Announcement {
    return this.svc.create(dto);
  }

  @Get()
  list(): Announcement[] {
    return this.svc.findAll();
  }

  @Patch(':id')
  patch(@Param('id') id: string, @Body() dto: UpdateAnnouncementStatusDto): Announcement {
    return this.svc.updateStatus(id, dto.status);
  }
}
