import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { GetChatMessagesUseCase } from '../../application/use-cases/get-chat-messages.use-case';
import { GetChatRoomsUseCase } from '../../application/use-cases/get-chat-rooms.use-case';
import { GetUnreadChatCountUseCase } from '../../application/use-cases/get-unread-chat-count.use-case';
import { MarkChatAsReadUseCase } from '../../application/use-cases/mark-chat-as-read.use-case';
import { TChatRoomListItem } from '../../application/ports/get-chat-rooms-use-case.interface';
import { Chat } from '../../domain/chat.entity';
import { ChatMessageResponseDto } from './dto/chat-message-response.dto';
import { ChatRoomResponseDto } from './dto/chat-room-response.dto';
import { GetChatMessagesRequestDto } from './dto/get-chat-messages-request.dto';
import { MarkChatAsReadRequestDto } from './dto/mark-chat-as-read-request.dto';
import { UnreadChatCountResponseDto } from './dto/unread-chat-count-response.dto';
import { GetChatMessagesDoc } from './docs/get-chat-messages.doc';
import { GetChatRoomsDoc } from './docs/get-chat-rooms.doc';
import { GetUnreadChatCountDoc } from './docs/get-unread-chat-count.doc';
import { MarkChatAsReadDoc } from './docs/mark-chat-as-read.doc';

@ApiTags('chat')
@Controller('chats')
export class ChatController {
  constructor(
    private readonly _getChatRoomsUseCase: GetChatRoomsUseCase,
    private readonly _getChatMessagesUseCase: GetChatMessagesUseCase,
    private readonly _markChatAsReadUseCase: MarkChatAsReadUseCase,
    private readonly _getUnreadChatCountUseCase: GetUnreadChatCountUseCase,
  ) {}

  @Get('rooms')
  @UseGuards(JwtAuthGuard)
  @GetChatRoomsDoc()
  async getRooms(
    @CurrentUser() user: TJwtPayload,
  ): Promise<{ data: ChatRoomResponseDto[] }> {
    const rooms = await this._getChatRoomsUseCase.execute({
      profileId: user.profileId,
    });

    return { data: rooms.map((room) => this._toChatRoomResponseDto(room)) };
  }

  @Get('messages')
  @UseGuards(JwtAuthGuard)
  @GetChatMessagesDoc()
  async getMessages(
    @CurrentUser() user: TJwtPayload,
    @Query() query: GetChatMessagesRequestDto,
  ): Promise<{
    data: ChatMessageResponseDto[];
    meta: { total: number; page: number; limit: number };
  }> {
    const result = await this._getChatMessagesUseCase.execute({
      postId: query.postId,
      buyerProfileId: query.buyerProfileId,
      requesterProfileId: user.profileId,
      page: query.page,
      limit: query.limit,
    });

    return {
      data: result.items.map((item) => this._toChatMessageResponseDto(item)),
      meta: { total: result.total, page: query.page, limit: query.limit },
    };
  }

  @Post('rooms/read')
  @UseGuards(JwtAuthGuard)
  @MarkChatAsReadDoc()
  async markRoomAsRead(
    @CurrentUser() user: TJwtPayload,
    @Body() body: MarkChatAsReadRequestDto,
  ): Promise<{ data: null }> {
    await this._markChatAsReadUseCase.execute({
      postId: body.postId,
      buyerProfileId: body.buyerProfileId,
      requesterProfileId: user.profileId,
    });

    return { data: null };
  }

  @Get('unread-count')
  @UseGuards(JwtAuthGuard)
  @GetUnreadChatCountDoc()
  async getUnreadCount(
    @CurrentUser() user: TJwtPayload,
  ): Promise<{ data: UnreadChatCountResponseDto }> {
    const result = await this._getUnreadChatCountUseCase.execute({
      profileId: user.profileId,
    });

    const dto = new UnreadChatCountResponseDto();
    dto.unreadRooms = result.unreadRooms;

    return { data: dto };
  }

  private _toChatRoomResponseDto(room: TChatRoomListItem): ChatRoomResponseDto {
    const dto = new ChatRoomResponseDto();
    dto.postId = room.postId;
    dto.counterpart = room.counterpart;
    dto.lastMessageContent = room.lastMessageContent;
    dto.lastMessageAt = room.lastMessageAt;
    return dto;
  }

  private _toChatMessageResponseDto(chat: Chat): ChatMessageResponseDto {
    const dto = new ChatMessageResponseDto();
    dto.id = chat.id as string;
    dto.postId = chat.postId;
    dto.ownerProfileId = chat.ownerProfileId;
    dto.buyerProfileId = chat.buyerProfileId;
    dto.senderProfileId = chat.senderProfileId;
    dto.content = chat.content;
    dto.createdAt = chat.createdAt;
    return dto;
  }
}
