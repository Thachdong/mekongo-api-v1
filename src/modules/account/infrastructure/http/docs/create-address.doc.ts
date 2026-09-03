import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { AddressResponseDto } from '../dto/address-response.dto';
import { CreateAddressRequestDto } from '../dto/create-address-request.dto';

export function CreateAddressDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo address mới cho account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: CreateAddressRequestDto }),
    ApiResponseData(AddressResponseDto, {
      status: 201,
      description: 'Tạo address thành công',
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — thiếu field hoặc sai kiểu',
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
