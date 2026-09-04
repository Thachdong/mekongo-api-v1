import { PostNotFoundError } from '../../domain/errors/post-not-found.error';
import { Post } from '../../domain/post.entity';
import { IPostRepository } from '../ports/post-repository.interface';
import { IncrementPostLikeCountUseCase } from './increment-post-like-count.use-case';

function buildPost(likeCount = 0) {
  return new Post({
    id: 'post-id',
    postType: 'SELL',
    title: 'title',
    content: 'content',
    images: [],
    provinceCode: 79,
    profileId: 'profile-id',
    likeCount,
    commentCount: 0,
    createdAt: null,
    updatedAt: null,
  });
}

describe('IncrementPostLikeCountUseCase', () => {
  let postRepository: jest.Mocked<IPostRepository>;
  let useCase: IncrementPostLikeCountUseCase;

  beforeEach(() => {
    postRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
    };
    useCase = new IncrementPostLikeCountUseCase(postRepository);
  });

  it('throws PostNotFoundError when post does not exist', async () => {
    postRepository.findById.mockResolvedValue(null);

    await expect(
      useCase.execute({ postId: 'post-id' }),
    ).rejects.toThrow(PostNotFoundError);
  });

  it('increments likeCount and persists the post', async () => {
    const post = buildPost(0);
    postRepository.findById.mockResolvedValue(post);
    postRepository.update.mockImplementation(async (p) => p);

    const result = await useCase.execute({ postId: 'post-id' });

    expect(result.likeCount).toBe(1);
    expect(postRepository.update).toHaveBeenCalledWith(post);
  });
});
