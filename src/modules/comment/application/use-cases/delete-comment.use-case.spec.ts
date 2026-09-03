import { CommentHasChildrenError } from '../../domain/errors/comment-has-children.error';
import { CommentNotFoundError } from '../../domain/errors/comment-not-found.error';
import { ForbiddenCommentDeletionError } from '../../domain/errors/forbidden-comment-deletion.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { ITransactionManager } from '../ports/transaction-manager.interface';
import { DeleteCommentUseCase } from './delete-comment.use-case';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'comment-id',
    content: 'content',
    parentId: null,
    postId: 'post-id',
    profileId: 'profile-id',
    childIds: [],
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('DeleteCommentUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let transactionManager: jest.Mocked<ITransactionManager>;
  let useCase: DeleteCommentUseCase;

  const baseInput = { profileId: 'profile-id', commentId: 'comment-id' };

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };
    transactionManager = {
      runInTransaction: jest.fn((work: () => Promise<unknown>) => work()),
    } as unknown as jest.Mocked<ITransactionManager>;

    useCase = new DeleteCommentUseCase(commentRepository, transactionManager);
  });

  it('throws ProfileNotActiveError when profileId is null', async () => {
    await expect(
      useCase.execute({ ...baseInput, profileId: null }),
    ).rejects.toThrow(ProfileNotActiveError);

    expect(commentRepository.findById).not.toHaveBeenCalled();
  });

  it('throws CommentNotFoundError when comment does not exist', async () => {
    commentRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      CommentNotFoundError,
    );

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it('throws ForbiddenCommentDeletionError when caller is not the owner', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ profileId: 'other-profile-id' }),
    );

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      ForbiddenCommentDeletionError,
    );

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it('throws CommentHasChildrenError when comment still has children', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ childIds: ['child-id'] }),
    );

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      CommentHasChildrenError,
    );

    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes a root comment without touching any parent', async () => {
    commentRepository.findById.mockResolvedValue(buildComment());

    await useCase.execute(baseInput);

    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id');
  });

  it('deletes a reply and removes it from the parent childIds', async () => {
    const child = buildComment({ id: 'comment-id', parentId: 'parent-id' });
    const parent = buildComment({
      id: 'parent-id',
      childIds: ['comment-id', 'other-child-id'],
    });
    commentRepository.findById.mockImplementation(async (id) =>
      id === 'comment-id' ? child : id === 'parent-id' ? parent : null,
    );

    await useCase.execute(baseInput);

    expect(parent.childIds).toEqual(['other-child-id']);
    expect(commentRepository.update).toHaveBeenCalledWith(parent);
    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id');
  });

  it('deletes a reply whose parent no longer exists without throwing', async () => {
    const child = buildComment({ id: 'comment-id', parentId: 'parent-id' });
    commentRepository.findById.mockImplementation(async (id) =>
      id === 'comment-id' ? child : null,
    );

    await expect(useCase.execute(baseInput)).resolves.toBeUndefined();

    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id');
  });
});
