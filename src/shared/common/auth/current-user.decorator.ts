import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TJwtPayload } from './jwt-payload.type';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TJwtPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
