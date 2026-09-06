import { ApiProperty } from '@nestjs/swagger';
import { TNotificationType } from '../../../domain/notification.entity';
import { NotificationActorResponseDto } from './notification-actor-response.dto';

export class NotificationListItemResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['NEW_COMMENT', 'NEW_REPLY'] })
  type: TNotificationType;

  @ApiProperty({ type: NotificationActorResponseDto })
  actor: NotificationActorResponseDto;

  @ApiProperty()
  postId: string;

  @ApiProperty()
  commentId: string;

  @ApiProperty()
  contentPreview: string;

  @ApiProperty()
  isRead: boolean;

  @ApiProperty({ type: String, format: 'date-time', nullable: true })
  createdAt: Date | null;
}
