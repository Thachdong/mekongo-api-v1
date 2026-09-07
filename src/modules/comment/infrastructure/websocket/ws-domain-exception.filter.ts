import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { DomainError } from '@shared/kernel/errors/domain-error';

@Catch()
export class WsDomainExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const client = host.switchToWs().getClient<Socket>();

    if (exception instanceof DomainError) {
      client.emit('error', {
        code: exception.code,
        message: exception.message,
        extra: exception.extra,
      });
      return;
    }

    if (exception instanceof WsException) {
      client.emit('error', {
        code: 'WS_AUTH_ERROR',
        message: exception.message,
      });
      return;
    }

    client.emit('error', {
      code: 'INTERNAL_ERROR',
      message: 'Internal server error',
    });
  }
}
