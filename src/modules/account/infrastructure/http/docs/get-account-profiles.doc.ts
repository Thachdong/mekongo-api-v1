import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { ProfileResponseDto } from '../dto/profile-response.dto';

export function GetAccountProfilesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách profile của account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(ProfileResponseDto, {
      status: 200,
      description: 'Danh sách profile',
      isArray: true,
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
