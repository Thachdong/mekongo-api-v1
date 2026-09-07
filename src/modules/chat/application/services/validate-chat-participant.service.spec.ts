import { IFindPostByIdUseCase } from '@modules/post/public-api';
import { Post } from '@modules/post/domain/post.entity';
import { SelfChatNotAllowedError } from '../../domain/errors/self-chat-not-allowed.error';
import { ChatParticipantForbiddenError } from '../../domain/errors/chat-participant-forbidden.error';
import { ValidateChatParticipantService } from './validate-chat-participant.service';

function buildPost(profileId: string) {
  return new Post({
    id: 'post-id',
    postType: 'SELL',
    title: 'title',
    content: 'content',
    images: [],
    provinceCode: 79,
    profileId,
    likeCount: 0,
    commentCount: 0,
    createdAt: null,
    updatedAt: null,
  });
}

describe('ValidateChatParticipantService', () => {
  let findPostByIdUseCase: jest.Mocked<IFindPostByIdUseCase>;
  let service: ValidateChatParticipantService;

  beforeEach(() => {
    findPostByIdUseCase = { execute: jest.fn() };
    service = new ValidateChatParticipantService(findPostByIdUseCase);
  });

  it('throws SelfChatNotAllowedError when buyer is the post owner', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost('owner-1'));

    await expect(
      service.execute({
        postId: 'post-id',
        buyerProfileId: 'owner-1',
        requesterProfileId: 'owner-1',
      }),
    ).rejects.toThrow(SelfChatNotAllowedError);
  });

  it('throws ChatParticipantForbiddenError when requester is neither owner nor buyer', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost('owner-1'));

    await expect(
      service.execute({
        postId: 'post-id',
        buyerProfileId: 'buyer-1',
        requesterProfileId: 'stranger-1',
      }),
    ).rejects.toThrow(ChatParticipantForbiddenError);
  });

  it('returns ownerProfileId when requester is the owner', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost('owner-1'));

    const result = await service.execute({
      postId: 'post-id',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'owner-1',
    });

    expect(result).toEqual({ ownerProfileId: 'owner-1' });
  });

  it('returns ownerProfileId when requester is the buyer', async () => {
    findPostByIdUseCase.execute.mockResolvedValue(buildPost('owner-1'));

    const result = await service.execute({
      postId: 'post-id',
      buyerProfileId: 'buyer-1',
      requesterProfileId: 'buyer-1',
    });

    expect(result).toEqual({ ownerProfileId: 'owner-1' });
  });
});
