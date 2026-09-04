import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CreatePostRequestDto } from '../dto/create-post-request.dto';
import { PostResponseDto } from '../dto/post-response.dto';

export function CreatePostDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo bài đăng mới cho account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: CreatePostRequestDto }),
    ApiResponseData(PostResponseDto, {
      status: 201,
      description: 'Tạo bài đăng thành công',
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
        'Account không tồn tại (ACCOUNT_NOT_FOUND), account chưa có địa chỉ hiện tại (CURRENT_ADDRESS_NOT_FOUND), hoặc ảnh trong TMP không hợp lệ/đã hết hạn (POST_IMAGE_SOURCE_INVALID)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: {
            type: 'string',
            enum: [
              'ACCOUNT_NOT_FOUND',
              'CURRENT_ADDRESS_NOT_FOUND',
              'POST_IMAGE_SOURCE_INVALID',
            ],
          },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Account chưa có hồ sơ (profile) hoạt động',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 422 },
          code: { type: 'string', example: 'PROFILE_NOT_ACTIVE' },
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
