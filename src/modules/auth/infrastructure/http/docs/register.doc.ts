import { applyDecorators } from '@nestjs/common';
import { ApiOperation, ApiBody } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { RegisterRequestDto } from '../dto/register-request.dto';
import { RegisterResponseDto } from '../dto/register-response.dto';

export function RegisterDoc() {
  return applyDecorators(
    ApiOperation({ summary: 'Đăng ký account mới' }),
    ApiBody({ type: RegisterRequestDto }),
    ApiResponseData(RegisterResponseDto, { status: 201 }),
  );
}
