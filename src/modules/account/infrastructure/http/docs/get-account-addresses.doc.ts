import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { AddressResponseDto } from '../dto/address-response.dto';

export function GetAccountAddressesDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Lấy danh sách address của account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiResponseData(AddressResponseDto, {
      status: 200,
      isArray: true,
      description: 'Danh sách address của account',
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
