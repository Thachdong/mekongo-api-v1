import { applyDecorators } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { SetActiveProfileRequestDto } from '../dto/set-active-profile-request.dto';

export function SetActiveProfileDoc() {
  return applyDecorators(
    ApiOperation({
      summary: 'Set activeProfileId của account đang đăng nhập',
    }),
    ApiBearerAuth('access-token'),
    ApiBody({ type: SetActiveProfileRequestDto }),
    ApiResponse({
      status: 200,
      description: 'Set active profile thành công',
      schema: {
        properties: {
          data: { type: 'object', nullable: true, example: null },
          meta: { type: 'object', additionalProperties: true, nullable: true },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Validation failed — profileId thiếu hoặc không phải UUID',
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
        'Profile không tồn tại/không thuộc account đang gọi, hoặc account không tồn tại',
      schema: {
        properties: {
          statusCode: { type: 'number', example: 404 },
          code: {
            type: 'string',
            enum: ['PROFILE_NOT_FOUND', 'ACCOUNT_NOT_FOUND'],
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
