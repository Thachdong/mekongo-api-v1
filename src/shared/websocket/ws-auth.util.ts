import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';

export function extractWsToken(client: Socket): string | undefined {
  const authToken = client.handshake.auth?.token as string | undefined;
  if (authToken) return authToken;

  const header = client.handshake.headers?.authorization;
  if (header?.startsWith('Bearer ')) return header.slice('Bearer '.length);

  const queryToken = client.handshake.query?.token;
  return typeof queryToken === 'string' ? queryToken : undefined;
}

export function verifyWsToken(
  client: Socket,
  jwtService: JwtService,
): TJwtPayload {
  const token = extractWsToken(client);

  if (!token) {
    throw new Error('Missing authentication token');
  }

  return jwtService.verify<TJwtPayload>(token);
}
