import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostModule } from '@modules/post/post.module';
import {
  CHAT_REPOSITORY,
  SEND_CHAT_MESSAGE_USECASE,
} from './application/ports/chat-application.tokens';
import { ValidateChatParticipantService } from './application/services/validate-chat-participant.service';
import { SendChatMessageUseCase } from './application/use-cases/send-chat-message.use-case';
import { ChatTypeOrmEntity } from './infrastructure/typeorm/entities/chat.typeorm-entity';
import { TypeOrmChatRepository } from './infrastructure/typeorm/chat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTypeOrmEntity]), PostModule],
  providers: [
    { provide: CHAT_REPOSITORY, useClass: TypeOrmChatRepository },
    ValidateChatParticipantService,
    SendChatMessageUseCase,
    { provide: SEND_CHAT_MESSAGE_USECASE, useExisting: SendChatMessageUseCase },
  ],
})
export class ChatModule {}
