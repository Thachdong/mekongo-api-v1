import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CommentListItemResponseDto } from '../dto/comment-list-item-response.dto';

export function GetCommentChildrenDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách comment con trực tiếp (1 cấp) của 1 comment cha',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(CommentListItemResponseDto, {
      status: 200,
      isArray: true,
      description: 'Danh sách comment con trực tiếp (không phân trang)',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — postId thiếu',
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
      status: 404,
      description:
        'Comment cha không tồn tại hoặc không thuộc post này (PARENT_COMMENT_NOT_FOUND)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'PARENT_COMMENT_NOT_FOUND' },
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
