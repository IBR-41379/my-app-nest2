// src/controllers/announcements.controller.ts
import { 
  Controller, 
  Get, 
  Param, 
  Headers, 
  NotFoundException,

} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';

import * as crypto from 'crypto';
import { AnnouncementResponseDto } from 'src/dto/announcement-response.dto';
import { AnnouncementsService } from './announcements.services';

@ApiTags('announcements')
@Controller('announcements')
export class AnnouncementsController {
  constructor(private readonly announcementsService: AnnouncementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all announcements with engagement metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of announcements',
    type: [AnnouncementResponseDto]
  })
  @ApiHeader({
    name: 'If-None-Match',
    description: 'ETag for caching',
    required: false
  })
  async findAll(
    @Headers('if-none-match') ifNoneMatch: string,
  ): Promise<AnnouncementResponseDto[]> {
    const announcements = await this.announcementsService.findAll();
    
    // Generate ETag
    const dataString = JSON.stringify(announcements);
    const etag = crypto.createHash('md5').update(dataString).digest('hex');
    
    // Check if client has the same version
    if (ifNoneMatch === etag) {
      throw new NotModifiedException();
    }
    
    return announcements;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific announcement with engagement metrics' })
  @ApiResponse({ 
    status: 200, 
    description: 'Announcement details',
    type: AnnouncementResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Announcement not found'
  })
  async findOne(@Param('id') id: string): Promise<AnnouncementResponseDto> {
    return this.announcementsService.findOne(id);
  }
}