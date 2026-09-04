import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Socket } from 'socket.io';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';

export const WsCurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TJwtPayload => {
    const client = ctx.switchToWs().getClient<Socket>();
    return client.data.user;
  },
);
