import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiResponse,
} from '@nestjs/swagger';

export function MarkNotificationAsReadDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Đánh dấu 1 thông báo đã đọc' }),
    ApiBearerAuth('access-token'),
    ApiParam({ name: 'id', description: 'Notification id' }),
    ApiResponse({
      status: 200,
      description: 'Đánh dấu đã đọc thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
        },
      },
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
    ApiResponse({
      status: 404,
      description:
        'Thông báo không tồn tại hoặc không thuộc về user hiện tại (NOTIFICATION_NOT_FOUND)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'NOTIFICATION_NOT_FOUND' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
  );
}
