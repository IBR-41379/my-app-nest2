// src/dtos/create-reaction.dto.ts
import { IsIn } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { ReactionType } from '../entities/reaction.entity';

export class CreateReactionDto {
  @ApiProperty({ 
    example: 'up', 
    description: 'The type of reaction',
    enum: ['up', 'down', 'heart']
  })
  @IsIn(['up', 'down', 'heart'])
  type: ReactionType;
}