import { ConfigService } from '@nestjs/config';
import { IFindPostByIdUseCase } from '@modules/post/public-api';
import { CommentLevelLimitExceededError } from '../../domain/errors/comment-level-limit-exceeded.error';
import { ParentCommentNotFoundError } from '../../domain/errors/parent-comment-not-found.error';
import { ProfileNotActiveError } from '../../domain/errors/profile-not-active.error';
import { Comment } from '../../domain/comment.entity';
import { ICommentRepository } from '../ports/comment-repository.interface';
import { CreateCommentUseCase } from './create-comment.use-case';

function buildComment(overrides: Record<string, unknown> = {}) {
  return new Comment({
    id: 'parent-id',
    content: 'parent content',
    parentId: null,
    postId: 'post-id',
    profileId: 'profile-id',
    level: 0,
    createdAt: null,
    updatedAt: null,
    ...overrides,
  });
}

describe('CreateCommentUseCase', () => {
  let commentRepository: jest.Mocked<ICommentRepository>;
  let findPostByIdUseCase: jest.Mocked<IFindPostByIdUseCase>;
  let configService: jest.Mocked<ConfigService>;
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
      delete: jest.fn(),
      hasChildren: jest.fn(),
    };
    findPostByIdUseCase = { execute: jest.fn() };
    configService = { getOrThrow: jest.fn() } as any;

    findPostByIdUseCase.execute.mockResolvedValue(undefined as any);
    configService.getOrThrow.mockReturnValue({ levelLimit: 3 });
    commentRepository.create.mockImplementation(
      async (comment) =>
        new Comment({
          id: 'created-id',
          content: comment.content,
          parentId: comment.parentId,
          postId: comment.postId,
          profileId: comment.profileId,
          level: comment.level,
          createdAt: new Date(),
          updatedAt: new Date(),
        }),
    );

    useCase = new CreateCommentUseCase(
      commentRepository,
      findPostByIdUseCase,
      configService,
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

  it('creates a root comment with level 0 when parentId is null', async () => {
    const result = await useCase.execute(baseInput);

    expect(findPostByIdUseCase.execute).toHaveBeenCalledWith({
      postId: 'post-id',
    });
    expect(commentRepository.create).toHaveBeenCalledTimes(1);
    expect(commentRepository.update).not.toHaveBeenCalled();
    expect(result.parentId).toBeNull();
    expect(result.level).toBe(0);
    expect(result.profileId).toBe('profile-id');
  });

  it('creates a reply with level = parent.level + 1', async () => {
    const parent = buildComment({ level: 1 });
    commentRepository.findById.mockResolvedValue(parent);

    const result = await useCase.execute({
      ...baseInput,
      parentId: 'parent-id',
    });

    expect(result.id).toBe('created-id');
    expect(result.parentId).toBe('parent-id');
    expect(result.level).toBe(2);
    expect(commentRepository.create).toHaveBeenCalledTimes(1);
    expect(commentRepository.update).not.toHaveBeenCalled();
  });

  it('throws CommentLevelLimitExceededError when computed level reaches the limit', async () => {
    configService.getOrThrow.mockReturnValue({ levelLimit: 3 });
    const parent = buildComment({ level: 2 });
    commentRepository.findById.mockResolvedValue(parent);

    await expect(
      useCase.execute({ ...baseInput, parentId: 'parent-id' }),
    ).rejects.toThrow(CommentLevelLimitExceededError);

    expect(commentRepository.create).not.toHaveBeenCalled();
  });
});
