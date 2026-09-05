import { UseFilters, UseGuards } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { WsCurrentUser } from '@shared/websocket/ws-current-user.decorator';
import { WsJwtGuard } from '@shared/websocket/ws-jwt.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ValidateChatParticipantService } from '../../application/services/validate-chat-participant.service';
import { SendChatMessageUseCase } from '../../application/use-cases/send-chat-message.use-case';
import { ChatMessageResponseDto } from '../http/dto/chat-message-response.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { WsDomainExceptionFilter } from './ws-domain-exception.filter';

function chatRoomKey(postId: string, buyerProfileId: string): string {
  return `chat:${postId}:${buyerProfileId}`;
}

@UseGuards(WsJwtGuard)
@UseFilters(WsDomainExceptionFilter)
@WebSocketGateway({ namespace: '/chat' })
export class ChatGateway {
  @WebSocketServer()
  private readonly _server: Server;

  constructor(
    private readonly _validateChatParticipantService: ValidateChatParticipantService,
    private readonly _sendChatMessageUseCase: SendChatMessageUseCase,
  ) {}

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
  }
}
