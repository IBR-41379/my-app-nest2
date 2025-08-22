import { IsString, MinLength, MaxLength } from "class-validator";

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(500)
  text: string;

  @IsString()
  @MinLength(1)
  authorName: string;
}