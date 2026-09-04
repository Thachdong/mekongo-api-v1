import {
  IFindAccountsByIdsUseCase,
  IFindProfilesByIdsUseCase,
} from '@modules/account/public-api';
import { Comment } from '../../domain/comment.entity';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { GetCommentsUseCase } from './get-comments.use-case';

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

describe('GetCommentsUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let findProfilesByIdsUseCase: jest.Mocked<IFindProfilesByIdsUseCase>;
  let findAccountsByIdsUseCase: jest.Mocked<IFindAccountsByIdsUseCase>;
  let useCase: GetCommentsUseCase;

  const baseInput = { postId: 'post-id', page: 1, limit: 20 };

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasChildren: jest.fn(),
      findRootByPostId: jest.fn(),
      countChildrenByParentIds: jest.fn(),
    };
    findProfilesByIdsUseCase = { execute: jest.fn() };
    findAccountsByIdsUseCase = { execute: jest.fn() };

    useCase = new GetCommentsUseCase(
      commentRepository,
      findProfilesByIdsUseCase,
      findAccountsByIdsUseCase,
    );
  });

  it('returns an empty list without calling author lookups when there are no root comments', async () => {
    commentRepository.findRootByPostId.mockResolvedValue({
      items: [],
      total: 0,
    });

    const result = await useCase.execute(baseInput);

    expect(result).toEqual({ items: [], total: 0 });
    expect(findProfilesByIdsUseCase.execute).not.toHaveBeenCalled();
    expect(findAccountsByIdsUseCase.execute).not.toHaveBeenCalled();
  });

  it('assembles children count and author for each root comment', async () => {
    const comment = buildComment();
    commentRepository.findRootByPostId.mockResolvedValue({
      items: [comment],
      total: 1,
    });
    commentRepository.countChildrenByParentIds.mockResolvedValue({
      'comment-1': 3,
    });
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
      {
        id: 'account-1',
        displayName: 'John',
        avatarUrl: 'avatar.png',
      } as any,
    ]);

    const result = await useCase.execute(baseInput);

    expect(commentRepository.countChildrenByParentIds).toHaveBeenCalledWith([
      'comment-1',
    ]);
    expect(findProfilesByIdsUseCase.execute).toHaveBeenCalledWith({
      profileIds: ['profile-1'],
    });
    expect(findAccountsByIdsUseCase.execute).toHaveBeenCalledWith({
      accountIds: ['account-1'],
    });
    expect(result).toEqual({
      items: [
        {
          id: 'comment-1',
          content: 'content',
          level: 0,
          parentId: null,
          childrenCount: 3,
          author: {
            profileId: 'profile-1',
            displayName: 'John',
            avatarUrl: 'avatar.png',
          },
        },
      ],
      total: 1,
    });
  });

  it('falls back to a null author when the profile is missing (orphaned data)', async () => {
    const comment = buildComment();
    commentRepository.findRootByPostId.mockResolvedValue({
      items: [comment],
      total: 1,
    });
    commentRepository.countChildrenByParentIds.mockResolvedValue({});
    findProfilesByIdsUseCase.execute.mockResolvedValue([]);
    findAccountsByIdsUseCase.execute.mockResolvedValue([]);

    const result = await useCase.execute(baseInput);

    expect(result.items[0].author).toEqual({
      profileId: 'profile-1',
      displayName: null,
      avatarUrl: null,
    });
    expect(result.items[0].childrenCount).toBe(0);
  });
});
