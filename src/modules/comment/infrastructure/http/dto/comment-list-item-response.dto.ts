import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CommentAuthorResponseDto } from './comment-author-response.dto';

export class CommentListItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  content: string;

  @ApiProperty()
  level: number;

  @ApiProperty({ type: String, nullable: true })
  parentId: string | null;

  @ApiPropertyOptional({
    description: 'Số lượng comment con trực tiếp — chỉ có ở danh sách root',
  })
  childrenCount?: number;

  @ApiProperty({ type: CommentAuthorResponseDto })
  author: CommentAuthorResponseDto;
}
