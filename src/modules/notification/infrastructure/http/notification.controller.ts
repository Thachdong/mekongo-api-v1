import { Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { GetNotificationsUseCase } from '../../application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from '../../application/use-cases/get-unread-notification-count.use-case';
import { MarkAllNotificationsAsReadUseCase } from '../../application/use-cases/mark-all-notifications-as-read.use-case';
import { MarkNotificationAsReadUseCase } from '../../application/use-cases/mark-notification-as-read.use-case';
import { TNotificationListItem } from '../../application/ports/get-notifications-use-case.interface';
import { GetNotificationsRequestDto } from './dto/get-notifications-request.dto';
import { NotificationListItemResponseDto } from './dto/notification-list-item-response.dto';
import { UnreadNotificationCountResponseDto } from './dto/unread-notification-count-response.dto';
import { GetNotificationsDoc } from './docs/get-notifications.doc';
import { GetUnreadNotificationCountDoc } from './docs/get-unread-notification-count.doc';
import { MarkAllNotificationsAsReadDoc } from './docs/mark-all-notifications-as-read.doc';
import { MarkNotificationAsReadDoc } from './docs/mark-notification-as-read.doc';

@ApiTags('notification')
@Controller('notifications')
export class NotificationController {
  constructor(
    private readonly _getNotificationsUseCase: GetNotificationsUseCase,
    private readonly _getUnreadNotificationCountUseCase: GetUnreadNotificationCountUseCase,
    private readonly _markNotificationAsReadUseCase: MarkNotificationAsReadUseCase,
    private readonly _markAllNotificationsAsReadUseCase: MarkAllNotificationsAsReadUseCase,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  @GetNotificationsDoc()
  async getNotifications(
    @CurrentUser() user: TJwtPayload,
    @Query() query: GetNotificationsRequestDto,
  ): Promise<{
    data: NotificationListItemResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    const result = await this._getNotificationsUseCase.execute({
      profileId: user.profileId,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.items.map((item) =>
        this._toNotificationListItemResponseDto(item),
      ),
      meta: { total: result.total, page: query.page, limit: query.limit },
    };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @GetUnreadNotificationCountDoc()
  async getUnreadCount(
    @CurrentUser() user: TJwtPayload,
  ): Promise<{ data: UnreadNotificationCountResponseDto }> {
    const result = await this._getUnreadNotificationCountUseCase.execute({
      profileId: user.profileId,
    });

    const dto = new UnreadNotificationCountResponseDto();
    dto.unreadCount = result.unreadCount;

    return { data: dto };
  }

  @Post(':id/read')
  @UseGuards(JwtAuthGuard)
  @MarkNotificationAsReadDoc()
  async markAsRead(
    @CurrentUser() user: TJwtPayload,
    @Param('id') id: string,
  ): Promise<{ data: null }> {
    await this._markNotificationAsReadUseCase.execute({
      notificationId: id,
      requesterProfileId: user.profileId,
    });

    return { data: null };
  }

  @Post('read-all')
  @UseGuards(JwtAuthGuard)
  @MarkAllNotificationsAsReadDoc()
  async markAllAsRead(
    @CurrentUser() user: TJwtPayload,
  ): Promise<{ data: null }> {
    await this._markAllNotificationsAsReadUseCase.execute({
      profileId: user.profileId,
    });

    return { data: null };
  }

  private _toNotificationListItemResponseDto(
    item: TNotificationListItem,
  ): NotificationListItemResponseDto {
    const dto = new NotificationListItemResponseDto();
    dto.id = item.id;
    dto.type = item.type;
    dto.actor = item.actor;
    dto.postId = item.postId;
    dto.commentId = item.commentId;
    dto.contentPreview = item.contentPreview;
    dto.isRead = item.isRead;
    dto.createdAt = item.createdAt;
    return dto;
  }
}
