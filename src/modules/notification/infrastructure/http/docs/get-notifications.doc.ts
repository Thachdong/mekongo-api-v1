import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { NotificationListItemResponseDto } from '../dto/notification-list-item-response.dto';

export function GetNotificationsDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách thông báo của user hiện tại, có phân trang',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(NotificationListItemResponseDto, {
      status: 200,
      isArray: true,
      description: 'Danh sách thông báo, sắp xếp theo thời gian giảm dần',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed (page/limit sai kiểu hoặc ngoài khoảng)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          message: { type: 'array', items: { type: 'string' } },
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
