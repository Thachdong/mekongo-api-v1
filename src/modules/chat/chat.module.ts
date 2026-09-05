import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CHAT_REPOSITORY } from './application/ports/chat-application.tokens';
import { ChatTypeOrmEntity } from './infrastructure/typeorm/entities/chat.typeorm-entity';
import { TypeOrmChatRepository } from './infrastructure/typeorm/chat.repository';

@Module({
  imports: [TypeOrmModule.forFeature([ChatTypeOrmEntity])],
  providers: [{ provide: CHAT_REPOSITORY, useClass: TypeOrmChatRepository }],
})
export class ChatModule {}
