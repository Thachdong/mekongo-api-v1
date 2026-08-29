import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { ResetPasswordRequestDto } from '../dto/reset-password-request.dto';
import { ResetPasswordResponseDto } from '../dto/reset-password-response.dto';

export function ResetPasswordDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Yêu cầu OTP để đặt lại mật khẩu' }),
    ApiBody({ type: ResetPasswordRequestDto }),
    ApiResponseData(ResetPasswordResponseDto, { status: 200 }),
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
