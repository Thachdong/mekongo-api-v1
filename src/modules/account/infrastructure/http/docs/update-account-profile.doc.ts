import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { UpdateAccountProfileRequestDto } from '../dto/update-account-profile-request.dto';

export function UpdateAccountProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary:
        'Cập nhật displayName/avatarUrl của 1 profile thuộc account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: UpdateAccountProfileRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Cập nhật profile thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', additionalProperties: true, nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Validation failed — thiếu profileId/không phải UUID, hoặc thiếu cả displayName và avatarUrl, hoặc field sai kiểu',
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
        'Không tìm thấy account, hoặc profileId không tồn tại/không thuộc account đang gọi, hoặc avatarUrl không phải file hợp lệ trong TMP',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: {
            type: 'string',
            enum: [
              'ACCOUNT_NOT_FOUND',
              'PROFILE_NOT_FOUND',
              'AVATAR_SOURCE_NOT_FOUND',
            ],
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
