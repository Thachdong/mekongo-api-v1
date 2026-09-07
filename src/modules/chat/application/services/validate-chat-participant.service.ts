import { Inject, Injectable } from '@nestjs/common';
import {
  FIND_POST_BY_ID_USECASE,
  IFindPostByIdUseCase,
} from '@modules/post/public-api';
import { SelfChatNotAllowedError } from '../../domain/errors/self-chat-not-allowed.error';
import { ChatParticipantForbiddenError } from '../../domain/errors/chat-participant-forbidden.error';

export type TValidateChatParticipantInput = {
  postId: string;
  buyerProfileId: string;
  requesterProfileId: string;
};

export type TValidateChatParticipantResult = {
  ownerProfileId: string;
};

@Injectable()
export class ValidateChatParticipantService {
  constructor(
    @Inject(FIND_POST_BY_ID_USECASE)
    private readonly _findPostByIdUseCase: IFindPostByIdUseCase,
  ) {}

  async execute(
    input: TValidateChatParticipantInput,
  ): Promise<TValidateChatParticipantResult> {
    const post = await this._findPostByIdUseCase.execute({
      postId: input.postId,
    });
    const ownerProfileId = post.profileId;

    if (input.buyerProfileId === ownerProfileId) {
      throw new SelfChatNotAllowedError();
    }

    if (
      input.requesterProfileId !== ownerProfileId &&
      input.requesterProfileId !== input.buyerProfileId
    ) {
      throw new ChatParticipantForbiddenError();
    }

    return { ownerProfileId };
  }
}
