import { ApiProperty } from '@nestjs/swagger';
import { TPostType } from '../../../domain/value-objects/post-type.enum';

export class PostResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  postType: TPostType;

  @ApiProperty()
  title: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  provinceCode: number;

  @ApiProperty()
  profileId: string;

  @ApiProperty()
  likeCount: number;

  @ApiProperty()
  commentCount: number;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  updatedAt: Date | null;
}
