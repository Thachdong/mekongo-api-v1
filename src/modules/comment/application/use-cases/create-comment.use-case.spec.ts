import { IFindPostByIdUseCase } from '@modules/post/public-api';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { ITransactionManager } from '../ports/transaction-manager.interface';
import { CreateCommentUseCase } from './create-comment.use-case';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'parent-id',
    content: 'parent content',
    parentId: null,
    postId: 'post-id',
    profileId: 'profile-id',
    childIds: [],
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('CreateCommentUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let transactionManager: jest.Mocked<ITransactionManager>;
  let findPostByIdUseCase: jest.Mocked<IFindPostByIdUseCase>;
  let useCase: CreateCommentUseCase;

  const baseInput = {
    profileId: 'profile-id',
    postId: 'post-id',
    parentId: null as string | null,
    content: 'hello',
  };

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    transactionManager = {
      runInTransaction: jest.fn((work: () => Promise<unknown>) => work()),
    } as unknown as jest.Mocked<ITransactionManager>;
    findPostByIdUseCase = { execute: jest.fn() };

    findPostByIdUseCase.execute.mockResolvedValue(undefined as any);
    commentRepository.create.mockImplementation(
      async (comment) =>
        new Comment({
          id: 'created-id',
          content: comment.content,
          parentId: comment.parentId,
          postId: comment.postId,
          profileId: comment.profileId,
          childIds: comment.childIds,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    );
    commentRepository.update.mockImplementation(async (comment) => comment);

    useCase = new CreateCommentUseCase(
      commentRepository,
      transactionManager,
      findPostByIdUseCase,
    );
  });

  it('throws ProfileNotActiveError when profileId is null', async () => {
    await expect(
      useCase.execute({ ...baseInput, profileId: null }),
    ).rejects.toThrow(ProfileNotActiveError);

    expect(findPostByIdUseCase.execute).not.toHaveBeenCalled();
    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it('throws ParentCommentNotFoundError when parentId does not exist', async () => {
    commentRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ ...baseInput, parentId: 'missing-parent' }),
    ).rejects.toThrow(ParentCommentNotFoundError);

    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it('throws ParentCommentNotFoundError when parent belongs to a different post', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ postId: 'other-post-id' }),
    );

    await expect(
      useCase.execute({ ...baseInput, parentId: 'parent-id' }),
    ).rejects.toThrow(ParentCommentNotFoundError);

    expect(commentRepository.create).not.toHaveBeenCalled();
  });

  it('creates a root comment without touching any parent', async () => {
    const result = await useCase.execute(baseInput);

    expect(findPostByIdUseCase.execute).toHaveBeenCalledWith({
      postId: 'post-id',
    });
    expect(commentRepository.create).toHaveBeenCalledTimes(1);
    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(result.parentId).toBeNull();
    expect(result.profileId).toBe('profile-id');
  });

  it('creates a reply and adds it to the parent childIds', async () => {
    const parent = buildComment();
    commentRepository.findById.mockResolvedValue(parent);

    const result = await useCase.execute({
      ...baseInput,
      parentId: 'parent-id',
    });

    expect(result.id).toBe('created-id');
    expect(commentRepository.create).toHaveBeenCalledTimes(1);
    expect(commentRepository.update).toHaveBeenCalledWith(parent);
    expect(parent.childIds).toEqual(['created-id']);
    expect(transactionManager.runInTransaction).toHaveBeenCalledTimes(1);
  });
});
