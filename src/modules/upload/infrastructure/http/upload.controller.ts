import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { GeneratePreSignUploadUrlsUseCase } from '../../application/use-cases/generate-pre-sign-upload-urls.use-case';
import { PreSignUploadRequestDto } from './dto/pre-sign-upload-request.dto';
import { PreSignUploadResponseDto } from './dto/pre-sign-upload-response.dto';
import { PreSignUploadDoc } from './docs/pre-sign-upload.doc';

@ApiTags('upload')
@Controller('uploads')
export class UploadController {
  constructor(
    private readonly _generatePreSignUploadUrlsUseCase: GeneratePreSignUploadUrlsUseCase,
  ) {}

  @Post('pre-sign-url')
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @PreSignUploadDoc()
  async preSignUpload(
    @Body() body: PreSignUploadRequestDto,
  ): Promise<PreSignUploadResponseDto> {
    return this._generatePreSignUploadUrlsUseCase.execute({
      files: body.files,
    });
  }
}
