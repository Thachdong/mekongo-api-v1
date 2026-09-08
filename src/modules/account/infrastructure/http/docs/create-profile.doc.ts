import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { ApiResponseData } from '@shared/common/swagger/api-response-data.decorator';
import { CreateProfileRequestDto } from '../dto/create-profile-request.dto';
import { ProfileResponseDto } from '../dto/profile-response.dto';

export function CreateProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Tạo profile mới cho account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: CreateProfileRequestDto }),
    ApiResponseData(ProfileResponseDto, {
      status: 201,
      description: 'Tạo profile thành công',
    }),
    ApiResponse({
      status: 400,
      description:
        'Validation failed (profileType thiếu/không hợp lệ, hoặc addressId/newAddress sai format) HOẶC không truyền đúng 1 trong 2 field addressId/newAddress (code INVALID_PROFILE_ADDRESS_INPUT)',
      schema: {
        oneOf: [
          {
            properties: {
              statusCode: { type: 'number', example: 400 },
              message: { type: 'array', items: { type: 'string' } },
              error: { type: 'string', example: 'Bad Request' },
            },
          },
          {
            properties: {
              statusCode: { type: 'number', example: 400 },
              code: {
                type: 'string',
                example: 'INVALID_PROFILE_ADDRESS_INPUT',
              },
              message: { type: 'string' },
              extra: { type: 'object', nullable: true },
            },
          },
        ],
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
      description: 'addressId truyền vào không thuộc về account đang đăng nhập',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: { type: 'string', example: 'ADDRESS_NOT_FOUND' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 409,
      description: 'Account đã có profile với profileType này',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 409 },
          code: { type: 'string', example: 'DUPLICATE_PROFILE_TYPE' },
          message: { type: 'string' },
          extra: { type: 'object', nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 422,
      description: 'Account đã đạt giới hạn tối đa 3 profile',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 422 },
          code: { type: 'string', example: 'MAX_PROFILE_LIMIT_REACHED' },
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
