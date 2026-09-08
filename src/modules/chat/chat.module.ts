import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '@modules/post/post.module';
import { AccountModule } from '@modules/account/account.module';
import { WsAuthModule } from '@shared/websocket/ws-auth.module';
import {
  CHAT_REPOSITORY,
  GET_CHAT_MESSAGES_USECASE,
  GET_CHAT_ROOMS_USECASE,
  GET_UNREAD_CHAT_COUNT_USECASE,
  MARK_CHAT_AS_READ_USECASE,
  SEND_CHAT_MESSAGE_USECASE,
} from './application/ports/chat-application.tokens';
import { ResolveChatParticipantsService } from './application/services/resolve-chat-participants.service';
import { ValidateChatParticipantService } from './application/services/validate-chat-participant.service';
import { GetChatMessagesUseCase } from './application/use-cases/get-chat-messages.use-case';
import { GetChatRoomsUseCase } from './application/use-cases/get-chat-rooms.use-case';
import { GetUnreadChatCountUseCase } from './application/use-cases/get-unread-chat-count.use-case';
import { MarkChatAsReadUseCase } from './application/use-cases/mark-chat-as-read.use-case';
import { SendChatMessageUseCase } from './application/use-cases/send-chat-message.use-case';
import { ChatController } from './infrastructure/http/chat.controller';
import { ChatGateway } from './infrastructure/websocket/chat.gateway';
import { ChatReadStateTypeOrmEntity } from './infrastructure/typeorm/entities/chat-read-state.typeorm-entity';
import { ChatTypeOrmEntity } from './infrastructure/typeorm/entities/chat.typeorm-entity';
import { TypeOrmChatRepository } from './infrastructure/typeorm/chat.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatTypeOrmEntity, ChatReadStateTypeOrmEntity]),
    PostModule,
    AccountModule,
    WsAuthModule,
  ],
  controllers: [ChatController],
  providers: [
    { provide: CHAT_REPOSITORY, useClass: TypeOrmChatRepository },
    ValidateChatParticipantService,
    ResolveChatParticipantsService,
    SendChatMessageUseCase,
    { provide: SEND_CHAT_MESSAGE_USECASE, useExisting: SendChatMessageUseCase },
    GetChatRoomsUseCase,
    { provide: GET_CHAT_ROOMS_USECASE, useExisting: GetChatRoomsUseCase },
    GetChatMessagesUseCase,
    { provide: GET_CHAT_MESSAGES_USECASE, useExisting: GetChatMessagesUseCase },
    MarkChatAsReadUseCase,
    { provide: MARK_CHAT_AS_READ_USECASE, useExisting: MarkChatAsReadUseCase },
    GetUnreadChatCountUseCase,
    {
      provide: GET_UNREAD_CHAT_COUNT_USECASE,
      useExisting: GetUnreadChatCountUseCase,
    },
    ChatGateway,
  ],
})
export class ChatModule {}
