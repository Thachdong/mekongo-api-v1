import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AccountModule } from '@modules/account/account.module';
import { WsAuthModule } from '@shared/websocket/ws-auth.module';
import {
  CREATE_NOTIFICATION_USECASE,
  GET_NOTIFICATIONS_USECASE,
  GET_UNREAD_NOTIFICATION_COUNT_USECASE,
  MARK_ALL_NOTIFICATIONS_AS_READ_USECASE,
  MARK_NOTIFICATION_AS_READ_USECASE,
  NOTIFICATION_REALTIME_PORT,
  NOTIFICATION_REPOSITORY,
} from './application/ports/notification-application.tokens';
import { ResolveNotificationActorsService } from './application/services/resolve-notification-actors.service';
import { CreateNotificationUseCase } from './application/use-cases/create-notification.use-case';
import { GetNotificationsUseCase } from './application/use-cases/get-notifications.use-case';
import { GetUnreadNotificationCountUseCase } from './application/use-cases/get-unread-notification-count.use-case';
import { MarkAllNotificationsAsReadUseCase } from './application/use-cases/mark-all-notifications-as-read.use-case';
import { MarkNotificationAsReadUseCase } from './application/use-cases/mark-notification-as-read.use-case';
import { NotificationController } from './infrastructure/http/notification.controller';
import { NotificationGateway } from './infrastructure/websocket/notification.gateway';
import { NotificationTypeOrmEntity } from './infrastructure/typeorm/entities/notification.typeorm-entity';
import { TypeOrmNotificationRepository } from './infrastructure/typeorm/notification.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationTypeOrmEntity]),
    AccountModule,
    WsAuthModule,
  ],
  controllers: [NotificationController],
  providers: [
    {
      provide: NOTIFICATION_REPOSITORY,
      useClass: TypeOrmNotificationRepository,
    },
    NotificationGateway,
    { provide: NOTIFICATION_REALTIME_PORT, useExisting: NotificationGateway },
    ResolveNotificationActorsService,
    CreateNotificationUseCase,
    {
      provide: CREATE_NOTIFICATION_USECASE,
      useExisting: CreateNotificationUseCase,
    },
    GetNotificationsUseCase,
    {
      provide: GET_NOTIFICATIONS_USECASE,
      useExisting: GetNotificationsUseCase,
    },
    GetUnreadNotificationCountUseCase,
    {
      provide: GET_UNREAD_NOTIFICATION_COUNT_USECASE,
      useExisting: GetUnreadNotificationCountUseCase,
    },
    MarkNotificationAsReadUseCase,
    {
      provide: MARK_NOTIFICATION_AS_READ_USECASE,
      useExisting: MarkNotificationAsReadUseCase,
    },
    MarkAllNotificationsAsReadUseCase,
    {
      provide: MARK_ALL_NOTIFICATIONS_AS_READ_USECASE,
      useExisting: MarkAllNotificationsAsReadUseCase,
    },
  ],
  exports: [CREATE_NOTIFICATION_USECASE],
})
export class NotificationModule {}
