import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SetProfileAddressRequestDto } from '../dto/set-profile-address-request.dto';

export function SetProfileAddressDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Gán 1 address có sẵn của account cho 1 profile',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: SetProfileAddressRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Gán address cho profile thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', additionalProperties: true, nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description:
        'Validation failed — profileId/addressId thiếu hoặc không phải UUID',
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
      status: 404,
      description:
        'Profile không tồn tại/không thuộc account đang gọi, hoặc address không tồn tại/không thuộc account đang gọi',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: {
            type: 'string',
            enum: ['PROFILE_NOT_FOUND', 'ADDRESS_NOT_FOUND'],
          },
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
