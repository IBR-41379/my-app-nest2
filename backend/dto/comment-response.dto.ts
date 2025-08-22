// src/dtos/comment-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

export class CommentResponseDto {
  @ApiProperty({ example: 'abc123', description: 'The unique identifier of the comment' })
  id: string;

  @ApiProperty({ example: 'John Doe', description: 'The name of the comment author' })
  authorName: string;

  @ApiProperty({ example: 'This is a great announcement!', description: 'The content of the comment' })
  text: string;

  @ApiProperty({ example: '2023-07-15T10:30:00.000Z', description: 'The date and time when the comment was created' })
  createdAt: Date;
}