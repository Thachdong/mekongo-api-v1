import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { UnreadNotificationCountResponseDto } from '../dto/unread-notification-count-response.dto';

export function GetUnreadNotificationCountDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy số lượng thông báo chưa đọc của user hiện tại (dùng cho badge icon notification)',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(UnreadNotificationCountResponseDto, {
      status: 200,
      description: 'Số thông báo chưa đọc',
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
