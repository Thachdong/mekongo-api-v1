import { CommentHasChildrenError } from '../../domain/errors/comment-has-children.error';
import { CommentNotFoundError } from '../../domain/errors/comment-not-found.error';
import { ForbiddenCommentDeletionError } from '../../domain/errors/forbidden-comment-deletion.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { DeleteCommentUseCase } from './delete-comment.use-case';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'comment-id',
    content: 'content',
    parentId: null,
    postId: 'post-id',
    profileId: 'profile-id',
    level: 0,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('DeleteCommentUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let useCase: DeleteCommentUseCase;

  const baseInput = { profileId: 'profile-id', commentId: 'comment-id' };

  beforeEach(() => {
    commentRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      hasChildren: jest.fn(),
    };
    commentRepository.hasChildren.mockResolvedValue(false);

    useCase = new DeleteCommentUseCase(commentRepository);
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

  it('throws CommentHasChildrenError when the comment still has replies', async () => {
    commentRepository.findById.mockResolvedValue(buildComment());
    commentRepository.hasChildren.mockResolvedValue(true);

    await expect(useCase.execute(baseInput)).rejects.toThrow(
      CommentHasChildrenError,
    );

    expect(commentRepository.hasChildren).toHaveBeenCalledWith('comment-id');
    expect(commentRepository.delete).not.toHaveBeenCalled();
  });

  it('deletes a root comment', async () => {
    commentRepository.findById.mockResolvedValue(buildComment());

    await useCase.execute(baseInput);

    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id');
  });

  it('deletes a reply without updating its parent', async () => {
    commentRepository.findById.mockResolvedValue(
      buildComment({ parentId: 'parent-id' }),
    );

    await useCase.execute(baseInput);

    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(commentRepository.delete).toHaveBeenCalledWith('comment-id');
  });
});
