import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function MarkAllNotificationsAsReadDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Đánh dấu tất cả thông báo của user hiện tại đã đọc',
    }),
    ApiBearerAuth('access-token'),
    ApiResponse({
      status: 200,
      description: 'Đánh dấu tất cả đã đọc thành công',
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
  );
}
