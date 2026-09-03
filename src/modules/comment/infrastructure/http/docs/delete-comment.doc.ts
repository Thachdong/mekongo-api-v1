import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { DeleteCommentRequestDto } from '../dto/delete-comment-request.dto';

export function DeleteCommentDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Xóa comment của chính mình (chỉ khi chưa có phản hồi)',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: DeleteCommentRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Xóa comment thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', additionalProperties: true, nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — commentId thiếu hoặc không phải UUID',
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
      description: 'Không phải chủ comment này',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          code: { type: 'string', example: 'FORBIDDEN_COMMENT_DELETION' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Comment không tồn tại',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'COMMENT_NOT_FOUND' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 422,
      description:
        'Account chưa có hồ sơ hoạt động (PROFILE_NOT_ACTIVE), hoặc comment còn phản hồi chưa xóa hết (COMMENT_HAS_CHILDREN)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 422 },
          code: {
            type: 'string',
            enum: ['PROFILE_NOT_ACTIVE', 'COMMENT_HAS_CHILDREN'],
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
