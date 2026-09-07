import { ApiProperty } from '@nestjs/swagger';

export class ChatMessageResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  ownerProfileId: string;

  @ApiProperty()
  buyerProfileId: string;

  @ApiProperty()
  senderProfileId: string;

  @ApiProperty()
  content: string;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;
}
