import { PostNotFoundError } from '../../domain/errors/post-not-found.error';
import { Post } from '../../domain/post.entity';
import { IPostRepository } from '../ports/post-repository.interface';
import { FindPostByIdUseCase } from './find-post-by-id.use-case';

function buildPost() {
  return new Post({
    id: 'post-id',
    postType: 'SELL',
    title: 'title',
    content: 'content',
    images: [],
    provinceCode: 79,
    profileId: 'profile-id',
    likeCount: 0,
    commentCount: 0,
    createdAt: null,
    updatedAt: null,
  });
}

describe('FindPostByIdUseCase', () => {
  let postRepository: jest.Mocked<IPostRepository>;
  let useCase: FindPostByIdUseCase;

  beforeEach(() => {
    postRepository = { create: jest.fn(), findById: jest.fn() };
    useCase = new FindPostByIdUseCase(postRepository);
  });

  it('throws PostNotFoundError when post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(useCase.execute({ postId: 'post-id' })).rejects.toThrow(
      PostNotFoundError,
    );
  });

  it('returns the post when found', async () => {
    const post = buildPost();
    postRepository.findById.mockResolvedValue(post);

    const result = await useCase.execute({ postId: 'post-id' });

    expect(result).toBe(post);
  });
});
