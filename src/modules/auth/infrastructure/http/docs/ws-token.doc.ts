import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { WsTokenResponseDto } from '../dto/ws-token-response.dto';

export function WsTokenDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Cấp JWT riêng (wsToken) dùng để authenticate WebSocket gateway (chat/notification/comment), tách biệt khỏi accessToken',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(WsTokenResponseDto, { status: 200 }),
    ApiResponse({
      status: 401,
      description: 'Thiếu/sai/hết hạn access token (Authorization header)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          message: { type: 'string' },
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
