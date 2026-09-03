import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { AccountResponseDto } from '../dto/account-response.dto';

export function GetAccountDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy thông tin account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(AccountResponseDto, {
      status: 200,
      description: 'Thông tin account',
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
      description: 'Account không tồn tại',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'ACCOUNT_NOT_FOUND' },
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
