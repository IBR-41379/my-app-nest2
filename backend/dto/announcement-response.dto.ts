// src/dtos/announcement-response.dto.ts
import { ApiProperty } from '@nestjs/swagger';

class ReactionsCountDto {
  @ApiProperty({ example: 5, description: 'Number of up reactions' })
  up: number;

  @ApiProperty({ example: 2, description: 'Number of down reactions' })
  down: number;

  @ApiProperty({ example: 3, description: 'Number of heart reactions' })
  heart: number;
}

export class AnnouncementResponseDto {
  @ApiProperty({ example: 'abc123', description: 'The unique identifier of the announcement' })
  id: string;

  @ApiProperty({ example: 'Welcome to GoBasera', description: 'The title of the announcement' })
  title: string;

  @ApiProperty({ example: 'We are excited to have you here!', description: 'The content of the announcement' })
  content: string;

  @ApiProperty({ example: 10, description: 'Number of comments on the announcement' })
  commentCount: number;

  @ApiProperty({ type: ReactionsCountDto, description: 'Count of reactions by type' })
  reactions: ReactionsCountDto;

  @ApiProperty({ example: '2023-07-15T10:30:00.000Z', description: 'The date and time of the last activity on the announcement' })
  lastActivityAt: Date;

  @ApiProperty({ example: '2023-07-10T08:15:00.000Z', description: 'The date and time when the announcement was created' })
  createdAt: Date;
}