import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '@modules/post/post.module';
import { AccountModule } from '@modules/account/account.module';
import {
  CHAT_REPOSITORY,
  GET_CHAT_MESSAGES_USECASE,
  GET_CHAT_ROOMS_USECASE,
  SEND_CHAT_MESSAGE_USECASE,
} from './application/ports/chat-application.tokens';
import { ResolveChatParticipantsService } from './application/services/resolve-chat-participants.service';
import { ValidateChatParticipantService } from './application/services/validate-chat-participant.service';
import { GetChatMessagesUseCase } from './application/use-cases/get-chat-messages.use-case';
import { GetChatRoomsUseCase } from './application/use-cases/get-chat-rooms.use-case';
import { SendChatMessageUseCase } from './application/use-cases/send-chat-message.use-case';
import { ChatController } from './infrastructure/http/chat.controller';
import { ChatTypeOrmEntity } from './infrastructure/typeorm/entities/chat.typeorm-entity';
import { TypeOrmChatRepository } from './infrastructure/typeorm/chat.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatTypeOrmEntity]),
    PostModule,
    AccountModule,
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
  ],
})
export class ChatModule {}
