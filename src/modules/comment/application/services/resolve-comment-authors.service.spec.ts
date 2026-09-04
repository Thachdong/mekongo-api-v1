import { IFindProfilesByIdsUseCase } from '@modules/account/public-api';
import { Comment } from '../../domain/comment.entity';
import { ResolveCommentAuthorsService } from './resolve-comment-authors.service';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'comment-1',
    content: 'content',
    parentId: null,
    postId: 'post-id',
    profileId: 'profile-1',
    level: 0,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('ResolveCommentAuthorsService', () => {
  let findProfilesByIdsUseCase: jest.Mocked<IFindProfilesByIdsUseCase>;
  let service: ResolveCommentAuthorsService;

  beforeEach(() => {
    findProfilesByIdsUseCase = { execute: jest.fn() };

    service = new ResolveCommentAuthorsService(findProfilesByIdsUseCase);
  });

  it('maps profileId to author info straight from Profile', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([
      {
        id: 'profile-1',
        activeProfile: 'INDIVIDUAL',
        accountId: 'account-1',
        displayName: 'John',
        avatarUrl: 'avatar.png',
        createdAt: null,
        updatedAt: null,
      } as any,
    ]);

    const result = await service.execute([buildComment()]);

    expect(findProfilesByIdsUseCase.execute).toHaveBeenCalledWith({
      profileIds: ['profile-1'],
    });
    expect(result.get('profile-1')).toEqual({
      profileId: 'profile-1',
      displayName: 'John',
      avatarUrl: 'avatar.png',
    });
  });

  it('returns an empty map when there are no comments', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([]);

    const result = await service.execute([]);

    expect(result.size).toBe(0);
  });
});
