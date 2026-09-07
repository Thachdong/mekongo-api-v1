import { ApiProperty } from '@nestjs/swagger';

export class UnreadChatCountResponseDto {
  @ApiProperty()
  unreadRooms: number;
}
