import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ChangePasswordRequestDto } from '../dto/change-password-request.dto';

export function ChangePasswordDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Đổi mật khẩu account đang đăng nhập' }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: ChangePasswordRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Đổi mật khẩu thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', additionalProperties: true, nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed',
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
      status: 401,
      description: 'currentPassword không khớp mật khẩu hiện tại',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          code: { type: 'string', example: 'INVALID_CURRENT_PASSWORD' },
          message: {
            type: 'string',
            example: 'Current password is incorrect',
          },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy account',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'ACCOUNT_NOT_FOUND' },
          message: { type: 'string', example: 'Account not found' },
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
