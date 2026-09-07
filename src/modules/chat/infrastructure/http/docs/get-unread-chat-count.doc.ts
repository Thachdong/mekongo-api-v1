import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { UnreadChatCountResponseDto } from '../dto/unread-chat-count-response.dto';

export function GetUnreadChatCountDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy số lượng room có tin nhắn chưa đọc của user hiện tại (dùng cho badge icon chat)',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(UnreadChatCountResponseDto, {
      status: 200,
      description: 'Số room có tin nhắn chưa đọc',
    }),
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
  );
}
