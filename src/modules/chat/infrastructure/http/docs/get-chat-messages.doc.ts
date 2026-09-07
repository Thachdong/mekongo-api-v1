import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { ChatMessageResponseDto } from '../dto/chat-message-response.dto';

export function GetChatMessagesDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Lấy lịch sử tin nhắn của 1 room (postId + buyerProfileId), có phân trang',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(ChatMessageResponseDto, {
      status: 200,
      isArray: true,
      description:
        'Danh sách tin nhắn của room, sắp xếp theo thời gian tăng dần',
    }),
    ApiResponse({
      status: 400,
      description:
        'Validation failed (thiếu postId/buyerProfileId hoặc page/limit sai kiểu), hoặc chủ post tự nhắn tin với chính mình (SELF_CHAT_NOT_ALLOWED)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          code: { type: 'string', enum: ['SELF_CHAT_NOT_ALLOWED'] },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
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
      status: 403,
      description:
        'Người gọi không phải chủ post cũng không phải người nhắn tin của room này (CHAT_PARTICIPANT_FORBIDDEN)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          code: { type: 'string', example: 'CHAT_PARTICIPANT_FORBIDDEN' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Post không tồn tại (POST_NOT_FOUND)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'POST_NOT_FOUND' },
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
