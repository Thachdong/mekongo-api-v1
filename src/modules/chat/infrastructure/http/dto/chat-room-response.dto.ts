import { ApiProperty } from '@nestjs/swagger';
import { ChatParticipantResponseDto } from './chat-participant-response.dto';

export class ChatRoomResponseDto {
  @ApiProperty()
  postId: string;

  @ApiProperty({ type: ChatParticipantResponseDto })
  counterpart: ChatParticipantResponseDto;

  @ApiProperty()
  lastMessageContent: string;

  @ApiProperty({ type: String, format: 'date-time' })
  lastMessageAt: Date;
}
