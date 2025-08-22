// src/controllers/comments.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Param, 
  Body, 
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ThrottlerGuard } from '@nestjs/throttler';
import { CommentResponseDto } from 'src/dto/comment-response.dto';
import { CreateCommentDto } from 'src/dto/create-comment.dto';
import { CommentsService } from './comment.services';


@ApiTags('comments')
@Controller('announcements/:id/comments')
@UseGuards(ThrottlerGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Post()
  @ApiOperation({ summary: 'Add a comment to an announcement' })
  @ApiResponse({ 
    status: 201, 
    description: 'Comment created successfully',
    type: CommentResponseDto
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Announcement not found'
  })
  async create(
    @Param('id') announcementId: string,
    @Body() createCommentDto: CreateCommentDto,
  ): Promise<CommentResponseDto> {
    return this.commentsService.create(announcementId, createCommentDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get paginated comments for an announcement' })
  @ApiResponse({ 
    status: 200, 
    description: 'Paginated comments',
  })
  @ApiResponse({ 
    status: 404, 
    description: 'Announcement not found'
  })
  @ApiQuery({ name: 'cursor', required: false, description: 'Cursor for pagination' })
  @ApiQuery({ name: 'limit', required: false, description: 'Number of comments to return (max 100)', type: Number })
  async findAll(
    @Param('id') announcementId: string,
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: number,
  ): Promise<{ comments: CommentResponseDto[]; nextCursor: string | null }> {
    return this.commentsService.findAll(announcementId, cursor, limit ? parseInt(limit as any, 10) : 10);
  }
}