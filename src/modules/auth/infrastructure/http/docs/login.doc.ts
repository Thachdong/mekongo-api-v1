import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { LoginRequestDto } from '../dto/login-request.dto';
import { LoginResponseDto } from '../dto/login-response.dto';

export function LoginDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Đăng nhập bằng identifier + password' }),
    ApiBody({ type: LoginRequestDto }),
    ApiResponseData(LoginResponseDto, { status: 200 }),
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
      description: 'Sai identifier hoặc password',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 401 },
          code: { type: 'string', example: 'INVALID_CREDENTIALS' },
          message: { type: 'string', example: 'Invalid credentials' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Account chưa ACTIVE (chưa kích hoạt)',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          code: { type: 'string', example: 'ACCOUNT_NOT_ACTIVE' },
          message: { type: 'string', example: 'Account is not active' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'Account đang bị block',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          code: { type: 'string', example: 'ACCOUNT_BLOCKED' },
          message: { type: 'string', example: 'Account is blocked' },
          extra: {
            type: 'object',
            properties: { blockUntil: { type: 'string', format: 'date-time' } },
          },
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
