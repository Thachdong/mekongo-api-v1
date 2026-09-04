import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CommentResponseDto } from '../dto/comment-response.dto';
import { CreateCommentRequestDto } from '../dto/create-comment-request.dto';

export function CreateCommentDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo comment mới cho 1 post (hoặc reply 1 comment khác)',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: CreateCommentRequestDto }),
    ApiResponseData(CommentResponseDto, {
      status: 201,
      description: 'Tạo comment thành công',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — thiếu field hoặc sai kiểu',
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
        'Post không tồn tại (POST_NOT_FOUND), hoặc parentId không tồn tại/không thuộc post này (PARENT_COMMENT_NOT_FOUND)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: {
            type: 'string',
            enum: ['POST_NOT_FOUND', 'PARENT_COMMENT_NOT_FOUND'],
          },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 422,
      description:
        'Account chưa có hồ sơ (profile) hoạt động (PROFILE_NOT_ACTIVE), hoặc độ sâu reply đã đạt giới hạn tối đa (COMMENT_LEVEL_LIMIT_EXCEEDED)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 422 },
          code: {
            type: 'string',
            enum: ['PROFILE_NOT_ACTIVE', 'COMMENT_LEVEL_LIMIT_EXCEEDED'],
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
