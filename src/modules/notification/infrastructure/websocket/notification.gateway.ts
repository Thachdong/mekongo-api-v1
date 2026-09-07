import { JwtService } from '@nestjs/jwt';
import {
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { verifyWsToken } from '@shared/websocket/ws-auth.util';
import { INotificationRealtimePort } from '../../application/ports/notification-realtime.interface';

function personalRoomKey(profileId: string): string {
  return `user:${profileId}`;
}

@WebSocketGateway({ namespace: '/notifications' })
export class NotificationGateway
  implements OnGatewayConnection, INotificationRealtimePort
{
  @WebSocketServer()
  private readonly _server: Server;

  constructor(private readonly _jwtService: JwtService) {}

  handleConnection(client: Socket): void {
    try {
      const user = verifyWsToken(client, this._jwtService);
      client.data.user = user;
      void client.join(personalRoomKey(user.profileId as string));
    } catch {
      client.disconnect();
    }
  }

  notify(profileId: string, payload: object): void {
    this._server
      .to(personalRoomKey(profileId))
      .emit('newNotification', payload);
  }
}
