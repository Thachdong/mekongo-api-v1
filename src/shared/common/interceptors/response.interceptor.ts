import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TMeta, TResponse } from '@shared/common/http/response.type';

function isMetaEnvelope(
  value: unknown,
): value is { data: unknown; meta?: TMeta } {
  return typeof value === 'object' && value !== null && 'data' in value;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<
  T,
  TResponse<T>
> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler,
  ): Observable<TResponse<T>> {
    return next.handle().pipe(
      map((result) => {
        if (isMetaEnvelope(result)) {
          return { data: (result.data ?? null) as T | null, meta: result.meta };
        }
        return { data: (result ?? null) as T | null };
      }),
    );
  }
}
