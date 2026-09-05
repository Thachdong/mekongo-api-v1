import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { verifyWsToken } from './ws-auth.util';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly _jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();

    try {
      client.data.user = verifyWsToken(client, this._jwtService);
      return true;
    } catch (error) {
      const message =
        error instanceof Error &&
        error.message === 'Missing authentication token'
          ? error.message
          : 'Invalid or expired authentication token';
      throw new WsException(message);
    }
  }
}
