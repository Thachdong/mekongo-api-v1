import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ActivateRequestDto } from '../dto/activate-request.dto';

export function ActivateDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xác thực OTP và kích hoạt account' }),
    ApiBody({ type: ActivateRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Xác thực thành công, account được kích hoạt',
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
      status: 400,
      description: 'OTP đã được sử dụng (consumed), không còn hiệu lực',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          code: { type: 'string', example: 'OTP_ALREADY_CONSUMED' },
          message: {
            type: 'string',
            example: 'No pending OTP action, please request a new OTP',
          },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'OTP đã hết hạn',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          code: { type: 'string', example: 'OTP_EXPIRED' },
          message: { type: 'string', example: 'OTP is expired' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'OTP code không khớp',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          code: { type: 'string', example: 'OTP_CODE_INVALID' },
          message: { type: 'string', example: 'OTP code is invalid' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Account không ở trạng thái PENDING_FOR_VERIFICATION nên không thể kích hoạt',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 400 },
          code: {
            type: 'string',
            example: 'INVALID_ACCOUNT_STATUS_TRANSITION',
          },
          message: {
            type: 'string',
            example:
              'Cannot transition account status from PENDING_FOR_VERIFICATION to ACTIVE',
          },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 403,
      description: 'OTP đang bị block do nhập sai quá số lần cho phép',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 403 },
          code: { type: 'string', example: 'OTP_BLOCKED' },
          message: { type: 'string', example: 'OTP is blocked' },
          extra: {
            type: 'object',
            properties: { blockUntil: { type: 'string', format: 'date-time' } },
          },
        },
      },
    }),
    ApiResponse({
      status: 404,
      description: 'Không tìm thấy OTP nào cho identifier này',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'OTP_NOT_FOUND' },
          message: { type: 'string', example: 'OTP not found' },
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
