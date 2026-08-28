import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { VerifyRequestDto } from '../dto/verify-request.dto';

export function VerifyDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Xác thực OTP và kích hoạt account' }),
    ApiBody({ type: VerifyRequestDto }),
    ApiResponse({ status: 200, description: 'Xác thực thành công' }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({
      status: 400,
      description: 'OTP is expired',
    }),
    ApiResponse({
      status: 400,
      description: 'OTP code is invalid',
    }),
    ApiResponse({
      status: 400,
      description:
        'Account không ở trạng thái PENDING_FOR_VERIFICATION nên không thể kích hoạt',
    }),
    ApiResponse({
      status: 403,
      description: 'OTP is blocked',
    }),
    ApiResponse({
      status: 404,
      description: 'OTP not found',
    }),
    ApiResponse({
      status: 404,
      description: 'Account not found',
    }),
  );
}
