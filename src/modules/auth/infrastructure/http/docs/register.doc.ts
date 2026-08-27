import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';

export function RegisterDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Đăng ký account mới' }),
    ApiBody({ type: RegisterRequestDto }),
    ApiResponseData(RegisterResponseDto, { status: 201 }),
    ApiResponse({ status: 400, description: 'Validation failed' }),
    ApiResponse({ status: 500, description: 'Internal server error' }),
  );
}
