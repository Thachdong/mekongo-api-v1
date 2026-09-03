import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { RefreshTokenRequestDto } from '../dto/refresh-token-request.dto';
import { RefreshTokenResponseDto } from '../dto/refresh-token-response.dto';

export function RefreshTokenDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Cấp lại accessToken + refreshToken mới từ refreshToken hiện có',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: RefreshTokenRequestDto }),
    ApiResponseData(RefreshTokenResponseDto, { status: 200 }),
    ApiResponse({
      status: 400,
      description: 'Validation failed',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'array', items: { type: 'string' } },
          error: { type: 'string', example: 'Bad Request' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description:
        'Thiếu/sai access token (Authorization header), hoặc refresh token không tồn tại/đã bị revoke/đã hết hạn',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          code: {
            type: 'string',
            example:
              'REFRESH_TOKEN_NOT_FOUND | REFRESH_TOKEN_REVOKED | REFRESH_TOKEN_EXPIRED',
          },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 500,
      description: 'Internal server error',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 500 },
          message: { type: 'string', example: 'Internal server error' },
        },
      },
    }),
  );
}
