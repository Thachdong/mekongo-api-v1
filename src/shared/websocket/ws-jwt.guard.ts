import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';

@Injectable()
export class WsJwtGuard implements CanActivate {
  constructor(private readonly _jwtService: JwtService) {}

  canActivate(context: ExecutionContext): boolean {
    const client = context.switchToWs().getClient<Socket>();
    const token = this._extractToken(client);

    if (!token) {
      throw new WsException('Missing authentication token');
    }

    try {
      const payload = this._jwtService.verify<TJwtPayload>(token);
      client.data.user = payload;
      return true;
    } catch {
      throw new WsException('Invalid or expired authentication token');
    }
  }

  private _extractToken(client: Socket): string | undefined {
    const authToken = client.handshake.auth?.token as string | undefined;
    if (authToken) return authToken;

    const header = client.handshake.headers?.authorization;
    if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

    const queryToken = client.handshake.query?.token;
    return typeof queryToken === 'string' ? queryToken : undefined;
  }
}
