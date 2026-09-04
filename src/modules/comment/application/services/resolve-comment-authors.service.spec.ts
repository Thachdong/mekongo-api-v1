import {
  IFindAccountsByIdsUseCase,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
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
  let findAccountsByIdsUseCase: jest.Mocked<IFindAccountsByIdsUseCase>;
  let service: ResolveCommentAuthorsService;

  beforeEach(() => {
    findProfilesByIdsUseCase = { execute: jest.fn() };
    findAccountsByIdsUseCase = { execute: jest.fn() };

    service = new ResolveCommentAuthorsService(
      findProfilesByIdsUseCase,
      findAccountsByIdsUseCase,
    );
  });

  it('maps profileId to author info by joining profile -> account', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([
      {
        id: 'profile-1',
        activeProfile: 'INDIVIDUAL',
        accountId: 'account-1',
        createdAt: null,
        updatedAt: null,
      } as any,
    ]);
    findAccountsByIdsUseCase.execute.mockResolvedValue([
      { id: 'account-1', displayName: 'John', avatarUrl: 'avatar.png' } as any,
    ]);

    const result = await service.execute([buildComment()]);

    expect(findProfilesByIdsUseCase.execute).toHaveBeenCalledWith({
      profileIds: ['profile-1'],
    });
    expect(findAccountsByIdsUseCase.execute).toHaveBeenCalledWith({
      accountIds: ['account-1'],
    });
    expect(result.get('profile-1')).toEqual({
      profileId: 'profile-1',
      displayName: 'John',
      avatarUrl: 'avatar.png',
    });
  });

  it('returns an empty map when there are no comments', async () => {
    findProfilesByIdsUseCase.execute.mockResolvedValue([]);
    findAccountsByIdsUseCase.execute.mockResolvedValue([]);

    const result = await service.execute([]);

    expect(result.size).toBe(0);
  });
});
