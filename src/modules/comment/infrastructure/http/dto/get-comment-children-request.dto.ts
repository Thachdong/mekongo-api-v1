import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GetCommentChildrenRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  postId: string;
}
