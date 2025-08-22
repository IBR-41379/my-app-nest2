// src/controllers/reactions.controller.ts
import { 
  Controller, 
  Post, 
  Delete, 
  Param, 
  Body, 
  Headers,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { CreateReactionDto } from '../dto/create-reaction.dto';
import { ReactionsService } from './reaction.service';


@ApiTags('reactions')
@Controller('announcements/:id/reactions')
export class ReactionsController {
  constructor(private readonly reactionsService: ReactionsService) {}

  @Post()
  @ApiOperation({ summary: 'Add or update a reaction to an announcement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reaction added successfully',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Announcement not found'
  })
  @ApiHeader({
    name: 'Idempotency-Key',
    description: 'Key for ensuring idempotent requests',
    required: false
  })
  @ApiHeader({
    name: 'X-User-Id',
    description: 'ID of the user adding the reaction',
    required: true
  })
  async create(
    @Param('id') announcementId: string,
    @Body() createReactionDto: CreateReactionDto,
    @Headers('idempotency-key') idempotencyKey: string,
    @Headers('x-user-id') userId: string,
  ): Promise<{ type: string }> {
    if (!userId) {
      throw new Error('X-User-Id header is required');
    }
    
    return this.reactionsService.create(
      announcementId,
      userId,
      createReactionDto.type,
      idempotencyKey,
    );
  }

  @Delete()
  @ApiOperation({ summary: 'Remove a user\'s reaction from an announcement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Reaction removed successfully',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Announcement not found'
  })
  @ApiHeader({
    name: 'X-User-Id',
    description: 'ID of the user removing the reaction',
    required: true
  })
  async remove(
    @Param('id') announcementId: string,
    @Headers('x-user-id') userId: string,
  ): Promise<void> {
    if (!userId) {
      throw new Error('X-User-Id header is required');
    }
    
    return this.reactionsService.remove(announcementId, userId);
  }
}