import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class DeleteCommentRequestDto {
  @ApiProperty()
  @IsUUID()
  @IsNotEmpty()
  commentId: string;
}
