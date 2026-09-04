import { ApiProperty } from '@nestjs/swagger';

export class CommentAuthorResponseDto {
  @ApiProperty()
  profileId: string;

  @ApiProperty({ type: String, nullable: true })
  displayName: string | null;

  @ApiProperty({ type: String, nullable: true })
  avatarUrl: string | null;
}
