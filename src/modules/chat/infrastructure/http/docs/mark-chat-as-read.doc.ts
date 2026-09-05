import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

export function MarkChatAsReadDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Đánh dấu 1 room (postId + buyerProfileId) đã đọc đến thời điểm hiện tại',
    }),
    ApiBearerAuth('access-token'),
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
      status: 400,
      description:
        'Validation failed (thiếu postId/buyerProfileId), hoặc chủ post tự nhắn tin với chính mình (SELF_CHAT_NOT_ALLOWED)',
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
