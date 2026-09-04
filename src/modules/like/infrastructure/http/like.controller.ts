import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '@shared/common/auth/current-user.decorator';
import { JwtAuthGuard } from '@shared/common/auth/jwt-auth.guard';
import { TJwtPayload } from '@shared/common/auth/jwt-payload.type';
import { ToggleLikeUseCase } from '../../application/use-cases/toggle-like.use-case';
import { ToggleLikeRequestDto } from './dto/toggle-like-request.dto';
import { ToggleLikeDoc } from './docs/toggle-like.doc';

@ApiTags('like')
@Controller('likes')
export class LikeController {
  constructor(private readonly _toggleLikeUseCase: ToggleLikeUseCase) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  @UseGuards(JwtAuthGuard)
  @ToggleLikeDoc()
  async toggle(
    @CurrentUser() user: TJwtPayload,
    @Body() body: ToggleLikeRequestDto,
  ): Promise<null> {
    await this._toggleLikeUseCase.execute({
      postId: body.postId,
      profileId: user.profileId as string,
    });

    return null;
  }
}
