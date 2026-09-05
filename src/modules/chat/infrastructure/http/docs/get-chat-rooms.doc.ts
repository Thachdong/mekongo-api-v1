import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { ChatRoomResponseDto } from '../dto/chat-room-response.dto';

export function GetChatRoomsDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy danh sách room chat của tôi (cả khi tôi là chủ post lẫn khi tôi là người nhắn tin), sắp xếp theo tin nhắn mới nhất',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(ChatRoomResponseDto, {
      status: 200,
      isArray: true,
      description:
        'Danh sách room, kèm thông tin đối phương và tin nhắn gần nhất',
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
