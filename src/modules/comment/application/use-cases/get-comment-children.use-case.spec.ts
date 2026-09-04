import { Comment } from '../../domain/comment.entity';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ResolveCommentAuthorsService } from '../services/resolve-comment-authors.service';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { GetCommentChildrenUseCase } from './get-comment-children.use-case';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'comment-id',
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

describe('GetCommentChildrenUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let resolveCommentAuthorsService: jest.Mocked<ResolveCommentAuthorsService>;
  let useCase: GetCommentChildrenUseCase;

  const baseInput = { postId: 'post-id', parentId: 'parent-id' };

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasChildren: jest.fn(),
      findRootByPostId: jest.fn(),
      countChildrenByParentIds: jest.fn(),
      findDirectChildren: jest.fn(),
    };
    resolveCommentAuthorsService = {
      execute: jest.fn(),
    } as unknown as jest.Mocked<ResolveCommentAuthorsService>;

    useCase = new GetCommentChildrenUseCase(
      commentRepository,
      resolveCommentAuthorsService,
    );
  });

  it('throws ParentCommentNotFoundError when the parent does not exist', async () => {
    commentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ParentCommentNotFoundError,
    );
    expect(commentRepository.findDirectChildren).not.toHaveBeenCalled();
  });

  it('throws ParentCommentNotFoundError when the parent belongs to a different post', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ id: 'parent-id', postId: 'other-post' }),
    );

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ParentCommentNotFoundError,
    );
  });

  it('returns an empty list without author lookups when there are no children', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ id: 'parent-id' }),
    );
    commentRepository.findDirectChildren.mockResolvedValue([]);

    const result = await useCase.execute(baseInput);

    expect(result).toEqual([]);
    expect(resolveCommentAuthorsService.execute).not.toHaveBeenCalled();
  });

  it('returns direct children with author, no childrenCount', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ id: 'parent-id' }),
    );
    const child = buildComment({
      id: 'child-id',
      parentId: 'parent-id',
      level: 1,
    });
    commentRepository.findDirectChildren.mockResolvedValue([child]);
    resolveCommentAuthorsService.execute.mockResolvedValue(
      new Map([
        [
          'profile-1',
          { profileId: 'profile-1', displayName: 'John', avatarUrl: null },
        ],
      ]),
    );

    const result = await useCase.execute(baseInput);

    expect(resolveCommentAuthorsService.execute).toHaveBeenCalledWith([child]);
    expect(result).toEqual([
      {
        id: 'child-id',
        content: 'content',
        level: 1,
        parentId: 'parent-id',
        author: {
          profileId: 'profile-1',
          displayName: 'John',
          avatarUrl: null,
        },
      },
    ]);
  });
});
