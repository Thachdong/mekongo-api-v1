import { UseFilters, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsCurrentUser } from '@shared/websocket/ws-current-user.decorator';
import { WsJwtGuard } from '@shared/websocket/ws-jwt.guard';
import { verifyWsToken } from '@shared/websocket/ws-auth.util';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ValidateChatParticipantService } from '../../application/services/validate-chat-participant.service';
import { GetUnreadChatCountUseCase } from '../../application/use-cases/get-unread-chat-count.use-case';
import { MarkChatAsReadUseCase } from '../../application/use-cases/mark-chat-as-read.use-case';
import { SendChatMessageUseCase } from '../../application/use-cases/send-chat-message.use-case';
import { ChatMessageResponseDto } from '../http/dto/chat-message-response.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { WsDomainExceptionFilter } from './ws-domain-exception.filter';

function chatRoomKey(postId: string, buyerProfileId: string): string {
  return `chat:${postId}:${buyerProfileId}`;
}

function personalRoomKey(profileId: string): string {
  return `user:${profileId}`;
}

@UseGuards(WsJwtGuard)
@UseFilters(WsDomainExceptionFilter)
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly _server: Server;

  constructor(
    private readonly _jwtService: JwtService,
    private readonly _validateChatParticipantService: ValidateChatParticipantService,
    private readonly _sendChatMessageUseCase: SendChatMessageUseCase,
    private readonly _markChatAsReadUseCase: MarkChatAsReadUseCase,
    private readonly _getUnreadChatCountUseCase: GetUnreadChatCountUseCase,
  ) {}

  handleConnection(client: Socket): void {
    try {
      const user = verifyWsToken(client, this._jwtService);
      client.data.user = user;
      void client.join(personalRoomKey(user.profileId));
    } catch {
      client.disconnect();
    }
  }

  @SubscribeMessage('joinRoom')
  async handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() body: JoinRoomDto,
    @WsCurrentUser() user: TJwtPayload,
  ): Promise<void> {
    await this._validateChatParticipantService.execute({
      postId: body.postId,
      buyerProfileId: body.buyerProfileId,
      requesterProfileId: user.profileId,
    });

    await client.join(chatRoomKey(body.postId, body.buyerProfileId));

    await this._markChatAsReadUseCase.execute({
      postId: body.postId,
      buyerProfileId: body.buyerProfileId,
      requesterProfileId: user.profileId,
    });

    const { unreadRooms } = await this._getUnreadChatCountUseCase.execute({
      profileId: user.profileId,
    });

    client.emit('unreadCountUpdated', { unreadRooms });
  }

  @SubscribeMessage('sendMessage')
  async handleSendMessage(
    @MessageBody() body: SendMessageDto,
    @WsCurrentUser() user: TJwtPayload,
  ): Promise<void> {
    const chat = await this._sendChatMessageUseCase.execute({
      postId: body.postId,
      buyerProfileId: body.buyerProfileId,
      senderProfileId: user.profileId,
      content: body.content,
    });

    const payload = new ChatMessageResponseDto();
    payload.id = chat.id as string;
    payload.postId = chat.postId;
    payload.ownerProfileId = chat.ownerProfileId;
    payload.buyerProfileId = chat.buyerProfileId;
    payload.senderProfileId = chat.senderProfileId;
    payload.content = chat.content;
    payload.createdAt = chat.createdAt;

    this._server
      .to(chatRoomKey(body.postId, body.buyerProfileId))
      .emit('newMessage', payload);

    const recipientProfileId =
      chat.senderProfileId === chat.ownerProfileId
        ? chat.buyerProfileId
        : chat.ownerProfileId;

    const { unreadRooms } = await this._getUnreadChatCountUseCase.execute({
      profileId: recipientProfileId,
    });

    this._server
      .to(personalRoomKey(recipientProfileId))
      .emit('chatNotification', {
        postId: chat.postId,
        buyerProfileId: chat.buyerProfileId,
        senderProfileId: chat.senderProfileId,
        content: chat.content,
        createdAt: chat.createdAt,
        unreadRooms,
      });
  }
}
