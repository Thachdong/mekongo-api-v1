import { ApiProperty } from '@nestjs/swagger';

export class UnreadNotificationCountResponseDto {
  @ApiProperty()
  unreadCount: number;
}
